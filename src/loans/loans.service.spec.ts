import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LoansService } from './loans.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LoansService', () => {
  let service: LoansService;
  let prisma: {
    user: { findFirst: jest.Mock };
    book: { findFirst: jest.Mock; update: jest.Mock };
    loan: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const mockUser = { id: 'user-1', name: 'John', email: 'john@a.com' };
  const mockBook = {
    id: 'book-1',
    title: 'Clean Code',
    author: 'Robert Martin',
    isbn: '123',
    available: true,
  };

  beforeEach(async () => {
    prisma = {
      user: { findFirst: jest.fn() },
      book: { findFirst: jest.fn(), update: jest.fn() },
      loan: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [LoansService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<LoansService>(LoansService);
  });

  describe('create', () => {
    it('lanza NotFoundException si el usuario no existe', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.create({ userId: 'user-1', bookId: 'book-1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza NotFoundException si el libro no existe', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.book.findFirst.mockResolvedValue(null);

      await expect(
        service.create({ userId: 'user-1', bookId: 'book-1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si el libro no está disponible', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.book.findFirst.mockResolvedValue({
        ...mockBook,
        available: false,
      });

      await expect(
        service.create({ userId: 'user-1', bookId: 'book-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('crea el préstamo y marca el libro como no disponible', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.book.findFirst.mockResolvedValue(mockBook);
      prisma.loan.create.mockResolvedValue({
        id: 'loan-1',
        userId: 'user-1',
        bookId: 'book-1',
      });

      const result = await service.create({
        userId: 'user-1',
        bookId: 'book-1',
      });

      expect(prisma.loan.create).toHaveBeenCalled();
      expect(prisma.book.update).toHaveBeenCalledWith({
        where: { id: 'book-1' },
        data: { available: false },
      });
      expect(result).toEqual({
        id: 'loan-1',
        userId: 'user-1',
        bookId: 'book-1',
      });
    });
  });

  describe('returnLoan', () => {
    it('lanza BadRequestException si el préstamo ya fue devuelto', async () => {
      prisma.loan.findUnique.mockResolvedValue({
        id: 'loan-1',
        bookId: 'book-1',
        returnDate: new Date(),
      });

      await expect(service.returnLoan('loan-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('marca el préstamo como devuelto y el libro como disponible', async () => {
      prisma.loan.findUnique.mockResolvedValue({
        id: 'loan-1',
        bookId: 'book-1',
        returnDate: null,
      });
      prisma.loan.update.mockResolvedValue({
        id: 'loan-1',
        bookId: 'book-1',
        returnDate: new Date(),
      });

      await service.returnLoan('loan-1');

      expect(prisma.book.update).toHaveBeenCalledWith({
        where: { id: 'book-1' },
        data: { available: true },
      });
    });
  });
});
