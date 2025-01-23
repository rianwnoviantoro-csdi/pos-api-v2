import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', title: 'name', required: true })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', title: 'code', required: true })
  code: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', title: 'type', required: true })
  type: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: 'number', title: 'parent ID', required: false })
  parent?: number;
}
