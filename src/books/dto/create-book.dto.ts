import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ example: 'Cien años de soledad' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Gabriel García Márquez' })
  @IsString()
  @IsNotEmpty()
  author!: string;

  @ApiProperty({ example: '9780307474728' })
  @IsString()
  @IsNotEmpty()
  isbn!: string;

  @ApiPropertyOptional({ example: 'La historia de la familia Buendía...' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1967 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  publishedYear?: number;

  @ApiPropertyOptional({ example: 471 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  pages?: number;

  @ApiPropertyOptional({ example: 'Español', default: 'Español' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ example: 7, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  totalCopies?: number;

  @ApiPropertyOptional({ example: 'uuid-de-la-categoria' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  status?: number;
}
