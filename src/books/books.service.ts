/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Book } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import 'multer';

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class BooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // Listar categorías para selects en el frontend
  async findAllCategories() {
    return this.prisma.bookCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(createBookDto: CreateBookDto, file?: Express.Multer.File) {
    const existing = await this.prisma.book.findUnique({
      where: { isbn: createBookDto.isbn },
    });

    if (existing) {
      throw new ConflictException('Ya existe un libro con ese ISBN');
    }

    if (createBookDto.categoryId) {
      await this.validateCategory(createBookDto.categoryId);
    }

    let imageKey: string | undefined;
    if (file) {
      this.validateImage(file);
      imageKey = await this.uploadNewImage(randomUUID(), file);
    }

    const totalCopies = createBookDto.totalCopies ?? 1;

    const book = await this.prisma.book.create({
      data: {
        ...createBookDto,
        totalCopies,
        availableCopies: totalCopies,
        imageKey,
      },
      include: { category: true },
    });

    return this.withImageUrl(book);
  }

  async findAll() {
    const books = await this.prisma.book.findMany({
      where: { deletedAt: null },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(books.map((book) => this.withImageUrl(book)));
  }

  async findOne(id: string) {
    const book = await this.findActiveBookOrThrow(id);
    return this.withImageUrl(book);
  }

  async update(
    id: string,
    updateBookDto: UpdateBookDto,
    file?: Express.Multer.File,
  ) {
    const existingBook = await this.findActiveBookOrThrow(id);

    if (updateBookDto.categoryId) {
      await this.validateCategory(updateBookDto.categoryId);
    }

    let imageKey = existingBook.imageKey;
    if (file) {
      this.validateImage(file);

      if (existingBook.imageKey) {
        await this.storage
          .deleteFile(existingBook.imageKey)
          .catch(() => undefined);
      }

      imageKey = await this.uploadNewImage(id, file);
    }

    // Ajustar copias disponibles si totalCopies cambia
    let availableCopies = existingBook.availableCopies;
    if (
      updateBookDto.totalCopies !== undefined &&
      updateBookDto.totalCopies !== existingBook.totalCopies
    ) {
      const diff = updateBookDto.totalCopies - existingBook.totalCopies;
      availableCopies = Math.max(0, existingBook.availableCopies + diff);
    }

    const book = await this.prisma.book.update({
      where: { id },
      data: {
        ...updateBookDto,
        availableCopies,
        imageKey,
      },
      include: { category: true },
    });

    return this.withImageUrl(book);
  }

  async remove(id: string) {
    await this.findActiveBookOrThrow(id);
    await this.prisma.book.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Libro eliminado correctamente' };
  }

  async removeImage(id: string) {
    const book = await this.findActiveBookOrThrow(id);

    if (!book.imageKey) {
      throw new BadRequestException('El libro no tiene una imagen asociada');
    }

    await this.storage.deleteFile(book.imageKey).catch(() => undefined);

    const updatedBook = await this.prisma.book.update({
      where: { id },
      data: { imageKey: null },
      include: { category: true },
    });

    return this.withImageUrl(updatedBook);
  }

  private validateImage(file: Express.Multer.File) {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Formatos aceptados: ${ALLOWED_IMAGE_MIME_TYPES.join(', ')}`,
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new BadRequestException('La imagen no puede superar los 5MB');
    }
  }

  private async validateCategory(categoryId: string) {
    const category = await this.prisma.bookCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('La categoría especificada no existe');
    }
  }

  private async uploadNewImage(bookId: string, file: Express.Multer.File) {
    const extension = file.mimetype.split('/')[1];
    const key = `books/${bookId}/${randomUUID()}.${extension}`;
    await this.storage.uploadFile(key, file.buffer, file.mimetype);
    return key;
  }

  private async findActiveBookOrThrow(id: string) {
    const book = await this.prisma.book.findFirst({
      where: { id, deletedAt: null },
      include: { category: true },
    });

    if (!book) {
      throw new NotFoundException(`Libro con id ${id} no encontrado`);
    }

    return book;
  }

  private async withImageUrl(book: Book & { category?: any }) {
    if (!book.imageKey) {
      return { ...book, imageUrl: null };
    }

    const imageUrl = await this.storage.getPresignedUrl(book.imageKey);
    return { ...book, imageUrl };
  }
}
