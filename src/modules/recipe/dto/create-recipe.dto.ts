import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

class IngredientDto {
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ type: 'number', title: 'id', required: true })
  id: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ type: 'number', title: 'amount', required: true })
  amount: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'number', title: 'unit', required: true })
  unit: string;
}

export class CreateRecipeDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', title: 'name', required: true })
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ type: 'number', title: 'cashier', required: true })
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ type: 'number', title: 'category', required: true })
  category: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      throw new Error('Invalid JSON format for ingredient');
    }
  })
  @ApiProperty({
    type: [IngredientDto],
    title: 'ingredient',
    required: true,
    description: 'Array of ingredient items',
  })
  ingredient: IngredientDto[];

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    description: 'Image file of the recipe',
  })
  image: any;
}
