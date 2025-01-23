import { BaseSchema } from 'src/commons/schemas/base.schema';
import { EntitySchema } from 'typeorm';

export interface Stock {
  id: number;
  name: string;
  unit: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;

  recipes?: any[];
}

export const StockSchema = new EntitySchema<Stock>({
  name: 'stocks',
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
    unit: {
      type: String,
    },
    amount: {
      type: String,
    },
  },
  relations: {
    recipes: {
      type: 'one-to-many',
      target: 'recipe_ingredients',
      inverseSide: 'stock',
    },
  },
  indices: [
    {
      name: 'IDX_STOCK_NAME',
      unique: true,
      columns: ['name'],
    },
    {
      name: 'IDX_STOCK_AMOUNT',
      unique: false,
      columns: ['amount'],
    },
  ],
  uniques: [
    {
      name: 'UNIQUE_STOCK_NAME',
      columns: ['name'],
    },
  ],
});
