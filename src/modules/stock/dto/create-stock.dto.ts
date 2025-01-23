import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateStockDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', title: 'name', required: true })
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: 'number', title: 'amount', required: true })
  amount: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', title: 'unit', required: true })
  unit: string;
}
