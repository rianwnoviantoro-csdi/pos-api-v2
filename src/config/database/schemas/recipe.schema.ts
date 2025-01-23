import { BaseSchema } from 'src/commons/schemas/base.schema';
import { EntitySchema } from 'typeorm';

export interface Recipe {
  id: number;
  name: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;

  ingredients?: any[];
  invoices: any[];
  category?: any;
}

export const RecipeSchema = new EntitySchema<Recipe>({
  name: 'recipes',
  columns: {
    ...BaseSchema,
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    name: {
      type: String,
    },
    price: {
      type: Number,
    },
  },
  relations: {
    ingredients: {
      type: 'one-to-many',
      target: 'recipe_ingredients',
      inverseSide: 'recipe',
    },
    invoices: {
      type: 'one-to-many',
      target: 'invoice_menues',
      inverseSide: 'recipe',
    },
    category: {
      type: 'many-to-one',
      target: 'categories',
      joinColumn: { name: 'category' },
      nullable: true,
      onDelete: 'CASCADE',
    },
  },
  indices: [
    {
      name: 'IDX_RECIPE_NAME',
      unique: true,
      columns: ['name'],
    },
    {
      name: 'IDX_RECIPE_PRICE',
      unique: false,
      columns: ['price'],
    },
  ],
  uniques: [
    {
      name: 'UNIQUE_RECIPE_NAME',
      columns: ['name'],
    },
  ],
});
