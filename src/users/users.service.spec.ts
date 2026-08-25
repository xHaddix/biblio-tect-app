import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed-password',
    role: 'CLIENT',
    createdAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
  });

  describe('create', () => {
    it('lanza ConflictException si el email ya existe', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.create({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('crea el usuario y excluye el password de la respuesta', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('findAll', () => {
    it('excluye usuarios con soft delete', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);

      await service.findAll();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
    });
  });

  describe('findOne', () => {
    it('lanza NotFoundException si el usuario no existe o fue eliminado', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.findOne('no-existe')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('retorna el usuario sin password si existe y no está eliminado', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.findOne('user-1');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'user-1', deletedAt: null },
      });
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('remove', () => {
    it('marca el usuario como eliminado (soft delete) en lugar de borrarlo', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });

      const result = await service.remove('user-1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { deletedAt: expect.any(Date) as Date },
      });
      expect(result).toEqual({ message: 'Usuario eliminado correctamente' });
    });
  });
});
