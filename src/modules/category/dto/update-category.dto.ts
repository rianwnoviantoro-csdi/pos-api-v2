import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsString()
  @ApiProperty({ type: 'string', title: 'name', required: false })
  name?: string;

  @IsString()
  @ApiProperty({ type: 'string', title: 'code', required: false })
  code?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', title: 'type', required: false })
  type?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: 'number', title: 'parent ID', required: false })
  parent?: number;
}
