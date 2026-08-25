import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

@Injectable()
export class LoansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLoanDto: CreateLoanDto) {
    const { userId, bookId } = createLoanDto;

    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
    }

    const book = await this.prisma.book.findFirst({
      where: { id: bookId, deletedAt: null },
    });
    if (!book) {
      throw new NotFoundException(`Libro con id ${bookId} no encontrado`);
    }

    if (book.availableCopies <= 0) {
      throw new BadRequestException('El libro no tiene copias disponibles');
    }

    return this.prisma.$transaction(async (tx) => {
      await this.prisma.book.update({
        where: { id: bookId },
        data: { availableCopies: { decrement: 1 } },
      });

      return tx.loan.create({
        data: { userId, bookId },
        include: { user: { select: userSelect }, book: true },
      });
    });
  }

  findAll() {
    return this.prisma.loan.findMany({
      include: { user: { select: userSelect }, book: true },
    });
  }

  async findOne(id: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: { user: { select: userSelect }, book: true },
    });

    if (!loan) {
      throw new NotFoundException(`Préstamo con id ${id} no encontrado`);
    }

    return loan;
  }

  async returnLoan(id: string) {
    const loan = await this.prisma.loan.findUnique({ where: { id } });

    if (!loan) {
      throw new NotFoundException(`Préstamo con id ${id} no encontrado`);
    }

    if (loan.returnDate) {
      throw new BadRequestException('Este préstamo ya fue devuelto');
    }

    return this.prisma.$transaction(async (tx) => {
      await this.prisma.book.update({
        where: { id: loan.bookId },
        data: { availableCopies: { increment: 1 } },
      });

      return tx.loan.update({
        where: { id },
        data: { returnDate: new Date() },
        include: { user: { select: userSelect }, book: true },
      });
    });
  }
}
