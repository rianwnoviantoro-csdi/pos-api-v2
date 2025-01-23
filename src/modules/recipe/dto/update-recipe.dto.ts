import { PartialType } from '@nestjs/mapped-types';
import { CreateRecipeDto } from './create-recipe.dto';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class IngredientDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: 'number', title: 'id', required: true })
  id: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: 'number', title: 'amount', required: true })
  amount: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'number', title: 'unit', required: true })
  unit: string;
}

export class UpdateRecipeDto extends PartialType(CreateRecipeDto) {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', title: 'name', required: true })
  name?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: 'number', title: 'cashier', required: true })
  price?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: 'number', title: 'category', required: true })
  category?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ApiProperty({
    type: [IngredientDto],
    title: 'ingredient',
    required: true,
    description: 'Array of ingredient items',
  })
  ingredient?: IngredientDto[];
}
