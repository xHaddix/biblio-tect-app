import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

describe('BooksService', () => {
  let service: BooksService;
  let prisma: {
    book: {
      findUnique: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };
  let storage: {
    uploadFile: jest.Mock;
    deleteFile: jest.Mock;
    getPresignedUrl: jest.Mock;
  };

  const mockBook = {
    id: 'book-1',
    title: 'Clean Code',
    author: 'Robert Martin',
    isbn: '978-1',
    available: true,
    imageKey: null,
    deletedAt: null,
  };

  const mockFile = {
    mimetype: 'image/png',
    size: 1024,
    buffer: Buffer.from('fake-image'),
  } as Express.Multer.File;

  beforeEach(async () => {
    prisma = {
      book: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };
    storage = {
      uploadFile: jest.fn().mockResolvedValue(undefined),
      deleteFile: jest.fn().mockResolvedValue(undefined),
      getPresignedUrl: jest.fn().mockResolvedValue('https://presigned-url'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  describe('create', () => {
    it('lanza ConflictException si el ISBN ya existe', async () => {
      prisma.book.findUnique.mockResolvedValue(mockBook);

      await expect(
        service.create({
          title: 'Clean Code',
          author: 'Robert Martin',
          isbn: '978-1',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('crea el libro sin imagen si no se adjunta archivo', async () => {
      prisma.book.findUnique.mockResolvedValue(null);
      prisma.book.create.mockResolvedValue(mockBook);

      const result = await service.create({
        title: 'Clean Code',
        author: 'Robert Martin',
        isbn: '978-1',
      });

      expect(storage.uploadFile).not.toHaveBeenCalled();
      expect(prisma.book.create).toHaveBeenCalledWith({
        data: {
          title: 'Clean Code',
          author: 'Robert Martin',
          isbn: '978-1',
          imageKey: undefined,
        },
      });
      expect(result).toEqual({ ...mockBook, imageUrl: null });
    });

    it('crea el libro y sube la imagen si se adjunta un archivo', async () => {
      prisma.book.findUnique.mockResolvedValue(null);
      prisma.book.create.mockResolvedValue({
        ...mockBook,
        imageKey: 'books/some-uuid/file.png',
      });

      const result = await service.create(
        { title: 'Clean Code', author: 'Robert Martin', isbn: '978-1' },
        mockFile,
      );

      expect(storage.uploadFile).toHaveBeenCalled();
      expect(result.imageUrl).toBe('https://presigned-url');
    });

    it('lanza BadRequestException si el archivo adjunto no es una imagen válida', async () => {
      prisma.book.findUnique.mockResolvedValue(null);

      await expect(
        service.create(
          { title: 'Clean Code', author: 'Robert Martin', isbn: '978-1' },
          { ...mockFile, mimetype: 'application/pdf' },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('excluye libros con soft delete', async () => {
      prisma.book.findMany.mockResolvedValue([mockBook]);

      await service.findAll();

      expect(prisma.book.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
    });
  });

  describe('findOne', () => {
    it('lanza NotFoundException si el libro no existe o fue eliminado', async () => {
      prisma.book.findFirst.mockResolvedValue(null);

      await expect(service.findOne('no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('retorna el libro con imageUrl null si no tiene imagen', async () => {
      prisma.book.findFirst.mockResolvedValue(mockBook);

      const result = await service.findOne('book-1');

      expect(result).toEqual({ ...mockBook, imageUrl: null });
      expect(storage.getPresignedUrl).not.toHaveBeenCalled();
    });

    it('retorna el libro con imageUrl firmada si tiene imagen', async () => {
      prisma.book.findFirst.mockResolvedValue({
        ...mockBook,
        imageKey: 'books/book-1/photo.jpg',
      });

      const result = await service.findOne('book-1');

      expect(storage.getPresignedUrl).toHaveBeenCalledWith(
        'books/book-1/photo.jpg',
      );
      expect(result.imageUrl).toBe('https://presigned-url');
    });
  });

  describe('update', () => {
    it('actualiza los datos sin tocar la imagen si no se adjunta archivo', async () => {
      prisma.book.findFirst.mockResolvedValue(mockBook);
      prisma.book.update.mockResolvedValue({
        ...mockBook,
        title: 'Clean Code 2nd Edition',
      });

      const result = await service.update('book-1', {
        title: 'Clean Code 2nd Edition',
      });

      expect(storage.deleteFile).not.toHaveBeenCalled();
      expect(storage.uploadFile).not.toHaveBeenCalled();
      expect(prisma.book.update).toHaveBeenCalledWith({
        where: { id: 'book-1' },
        data: { title: 'Clean Code 2nd Edition', imageKey: null },
      });
      expect(result.title).toBe('Clean Code 2nd Edition');
    });

    it('reemplaza la imagen y elimina la anterior si se adjunta un archivo', async () => {
      prisma.book.findFirst.mockResolvedValue({
        ...mockBook,
        imageKey: 'books/book-1/old-image.png',
      });
      prisma.book.update.mockResolvedValue({
        ...mockBook,
        imageKey: 'books/book-1/new-image.png',
      });

      const result = await service.update('book-1', {}, mockFile);

      expect(storage.deleteFile).toHaveBeenCalledWith(
        'books/book-1/old-image.png',
      );
      expect(storage.uploadFile).toHaveBeenCalled();
      expect(result.imageUrl).toBe('https://presigned-url');
    });
  });

  describe('remove', () => {
    it('marca el libro como eliminado (soft delete) en lugar de borrarlo', async () => {
      prisma.book.findFirst.mockResolvedValue(mockBook);
      prisma.book.update.mockResolvedValue({
        ...mockBook,
        deletedAt: new Date(),
      });

      const result = await service.remove('book-1');

      expect(prisma.book.update).toHaveBeenCalledWith({
        where: { id: 'book-1' },
        data: { deletedAt: expect.any(Date) as Date },
      });
      expect(result).toEqual({ message: 'Libro eliminado correctamente' });
    });
  });

  describe('removeImage', () => {
    it('lanza BadRequestException si el libro no tiene imagen', async () => {
      prisma.book.findFirst.mockResolvedValue(mockBook);

      await expect(service.removeImage('book-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('elimina la imagen del storage y limpia el imageKey', async () => {
      prisma.book.findFirst.mockResolvedValue({
        ...mockBook,
        imageKey: 'books/book-1/photo.jpg',
      });
      prisma.book.update.mockResolvedValue({ ...mockBook, imageKey: null });

      const result = await service.removeImage('book-1');

      expect(storage.deleteFile).toHaveBeenCalledWith('books/book-1/photo.jpg');
      expect(prisma.book.update).toHaveBeenCalledWith({
        where: { id: 'book-1' },
        data: { imageKey: null },
      });
      expect(result.imageUrl).toBeNull();
    });
  });
});
