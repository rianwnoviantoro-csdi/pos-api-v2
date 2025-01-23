import { BaseSchema } from 'src/commons/schemas/base.schema';
import { EntitySchema } from 'typeorm';

export interface Category {
  id: number;
  name: string;
  slug: string;
  code: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;

  parent?: any;
  children?: any[];
}

export const CategorySchema = new EntitySchema<Category>({
  name: 'categories',
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
    slug: {
      type: String,
    },
    code: {
      type: String,
    },
    type: {
      type: String, // This field will store whether it's a category or subcategory
      nullable: false,
    },
  },
  relations: {
    parent: {
      type: 'many-to-one', // Subcategory has many-to-one relation with Category
      target: 'categories',
      joinColumn: { name: 'parent' }, // Foreign key column in the table
      nullable: true, // Subcategory may not have a parent category
      onDelete: 'CASCADE',
    },
    children: {
      type: 'one-to-many',
      target: 'categories',
      inverseSide: 'parent',
    },
  },
  indices: [
    {
      name: 'IDX_CATEGORY_NAME',
      unique: true,
      columns: ['name'],
    },
    {
      name: 'IDX_CATEGORY_SLUG',
      unique: true,
      columns: ['slug'],
    },
    {
      name: 'IDX_CATEGORY_CODE',
      unique: true,
      columns: ['code'],
    },
    {
      name: 'IDX_CATEGORY_TYPE',
      unique: false,
      columns: ['type'],
    },
  ],
  uniques: [
    {
      name: 'UNIQUE_CATEGORY_NAME',
      columns: ['name'],
    },
    {
      name: 'UNIQUE_CATEGORY_SLUG',
      columns: ['slug'],
    },
    {
      name: 'UNIQUE_CATEGORY_CODE',
      columns: ['code'],
    },
  ],
});
