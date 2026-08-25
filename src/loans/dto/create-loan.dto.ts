import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLoanDto {
  @ApiProperty({ example: '565c05d9-8447-4c56-9123-6ef8a3b6e0de' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ example: 'f16d8c76-01fe-4bdf-83e0-f27392fb52e1' })
  @IsString()
  @IsNotEmpty()
  bookId!: string;
}
