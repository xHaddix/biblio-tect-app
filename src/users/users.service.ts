import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    return this.excludePassword(user);
  }

  async findAll() {
    // Retorna todos los usuarios activos e inactivos (excluyendo solo los eliminados con deletedAt)
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((user) => this.excludePassword(user));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    return this.excludePassword(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({ where: { email, deletedAt: null } });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const data = { ...updateUserDto };

    // Si viene la contraseña, se procesa el hash; si no viene o viene vacía, la omitimos
    if (data.password && data.password.trim() !== '') {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      delete data.password;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
    });

    return this.excludePassword(user);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 0 },
    });
    return { message: 'Usuario eliminado correctamente' };
  }

  private excludePassword<T extends { password: string }>(
    user: T,
  ): Omit<T, 'password'> {
    const rest = { ...user } as Partial<T>;
    delete rest.password;
    return rest as Omit<T, 'password'>;
  }
}
