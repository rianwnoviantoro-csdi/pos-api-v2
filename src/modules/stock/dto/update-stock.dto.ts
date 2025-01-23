import { PartialType } from '@nestjs/mapped-types';
import { CreateStockDto } from './create-stock.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStockDto extends PartialType(CreateStockDto) {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', title: 'name', required: true })
  name?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: 'number', title: 'amount', required: true })
  amount?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', title: 'unit', required: true })
  unit?: string;
}
