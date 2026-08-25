import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import 'multer';

const bookImageBodySchema = {
  type: 'object',
  properties: {
    title: { type: 'string', example: 'Cien años de soledad' },
    author: { type: 'string', example: 'Gabriel García Márquez' },
    isbn: { type: 'string', example: '9780307474728' },
    description: {
      type: 'string',
      example: 'Historia de la familia Buendía...',
    },
    publishedYear: { type: 'number', example: 1967 },
    pages: { type: 'number', example: 471 },
    language: { type: 'string', example: 'Español' },
    totalCopies: { type: 'number', example: 7 },
    categoryId: { type: 'string', example: 'uuid-de-la-categoria' },
    status: { type: 'number', example: 1 },
    file: {
      type: 'string',
      format: 'binary',
      description: 'Imagen de portada (jpg, png o webp, máx. 5MB)',
    },
  },
};

const createBookBodySchema = {
  ...bookImageBodySchema,
  required: ['title', 'author', 'isbn'],
};

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('categories')
  @ApiOperation({
    summary: 'Obtener categorías de libros',
    description:
      'Retorna el listado de categorías disponibles. Acceso público.',
  })
  getCategories() {
    return this.booksService.findAllCategories();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CLIENT)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: createBookBodySchema })
  @ApiOperation({ summary: 'Crear un libro' })
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.booksService.create(createBookDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Listar libros' })
  findAll() {
    return this.booksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un libro por id' })
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CLIENT)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: bookImageBodySchema })
  @ApiOperation({ summary: 'Actualizar un libro' })
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.booksService.update(id, updateBookDto, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un libro (soft delete)' })
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }

  @Delete(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar la imagen de un libro' })
  removeImage(@Param('id') id: string) {
    return this.booksService.removeImage(id);
  }
}
