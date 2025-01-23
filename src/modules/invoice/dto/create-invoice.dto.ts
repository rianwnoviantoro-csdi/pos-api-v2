import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class MenuDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: 'number', title: 'id', required: true })
  id: number;
}

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', title: 'customer', required: true })
  customer: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: 'number', title: 'amount', required: true })
  amount: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ApiProperty({
    type: [MenuDto],
    title: 'menus',
    required: false,
    description: 'Array of menu items',
  })
  menus?: MenuDto[];

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', title: 'payment', required: true })
  payment: string;
}
