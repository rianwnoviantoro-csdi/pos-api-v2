import { BaseSchema } from 'src/commons/schemas/base.schema';
import { EntitySchema } from 'typeorm';

export interface RecipeIngredient {
  id: number;
  stock: any;
  amount: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;

  recipe?: any;
  ingredient?: any;
}

export const RecipeIngredientSchema = new EntitySchema<RecipeIngredient>({
  name: 'recipe_ingredients',
  columns: {
    ...BaseSchema,
    amount: {
      type: Number,
    },
    unit: {
      type: String,
    },
  },
  relations: {
    recipe: {
      type: 'many-to-one',
      target: 'recipes',
      joinColumn: {
        name: 'recipe',
      },
      onDelete: 'CASCADE',
    },
    ingredient: {
      type: 'many-to-one',
      target: 'stocks',
      joinColumn: {
        name: 'ingredient',
      },
      onDelete: 'CASCADE',
    },
  },
});
