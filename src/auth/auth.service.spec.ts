import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: { findUnique: jest.Mock; findFirst: jest.Mock; create: jest.Mock };
  };
  let jwtService: { sign: jest.Mock };

  const mockUser = {
    id: 'user-id',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed-password',
    role: 'CLIENT',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };
    jwtService = { sign: jest.fn().mockReturnValue('signed-jwt-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('register', () => {
    it('lanza ConflictException si el email ya existe', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('crea el usuario con password hasheado y retorna token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('signed-jwt-token');
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    it('lanza UnauthorizedException si el usuario no existe', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'noexiste@example.com', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si el password no coincide', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: mockUser.email, password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('retorna accessToken y usuario sin password si las credenciales son válidas', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: mockUser.email,
        password: 'password123',
      });

      expect(result.accessToken).toBe('signed-jwt-token');
      expect(result.user).not.toHaveProperty('password');
    });
  });
});
