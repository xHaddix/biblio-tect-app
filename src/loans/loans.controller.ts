import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLoanDto } from './dto/create-loan.dto';
import { LoansService } from './loans.service';

@ApiTags('loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @ApiOperation({
    summary: 'Registrar un préstamo',
    description:
      'Crea un préstamo asociando un usuario con un libro disponible y marca el libro como no disponible (available: false).',
  })
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar préstamos',
    description:
      'Retorna todos los préstamos registrados, incluyendo los datos del usuario y del libro asociados.',
  })
  findAll() {
    return this.loansService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un préstamo por id',
    description:
      'Retorna el detalle de un préstamo específico, incluyendo usuario y libro asociados.',
  })
  findOne(@Param('id') id: string) {
    return this.loansService.findOne(id);
  }

  @Patch(':id/return')
  @ApiOperation({
    summary: 'Registrar la devolución de un préstamo',
    description:
      'Marca el préstamo como devuelto (returnDate) y actualiza el libro asociado a disponible (available: true).',
  })
  returnLoan(@Param('id') id: string) {
    return this.loansService.returnLoan(id);
  }
}
