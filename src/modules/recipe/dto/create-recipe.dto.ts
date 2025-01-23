import { ApiProperty } from '@nestjs/swagger';
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

export class CreateRecipeDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', title: 'name', required: true })
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: 'number', title: 'cashier', required: true })
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: 'number', title: 'category', required: true })
  category: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @ApiProperty({
    type: [IngredientDto],
    title: 'ingredient',
    required: true,
    description: 'Array of ingredient items',
  })
  ingredient: IngredientDto[];
}
