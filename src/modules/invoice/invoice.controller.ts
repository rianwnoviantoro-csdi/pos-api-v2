import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/commons/guards/role.guard';
import { Permissions } from 'src/commons/decorators/role.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { FilterInvoiceDto } from './dto/filter-invoice.dto';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('write:invoice')
  @ApiBearerAuth()
  async create(
    @Req() req: Request,
    @Body() createInvoiceDto: CreateInvoiceDto,
  ) {
    const result = await this.invoiceService.create(req, createInvoiceDto);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('read:invoice')
  @ApiBearerAuth()
  async findAll(@Query() filter: FilterInvoiceDto) {
    const { data, meta } = await this.invoiceService.findAll(filter);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data,
      meta,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('read:invoice')
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    const result = await this.invoiceService.findOne(+id);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }
}
