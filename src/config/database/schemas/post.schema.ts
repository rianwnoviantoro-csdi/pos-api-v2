import { BaseSchema } from 'src/commons/schemas/base.schema';
import { EntitySchema } from 'typeorm';

export interface Post {
  id: number;
  title: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;

  categories?: any[];
}

export const PostEntity = new EntitySchema<Post>({
  name: 'posts',
  columns: {
    ...BaseSchema,
    title: {
      type: String,
    },
    text: {
      type: String,
    },
  },
  relations: {
    categories: {
      type: 'many-to-many',
      target: 'categories',
      joinTable: {
        name: 'post_categories',
        joinColumn: {
          name: 'post',
          referencedColumnName: 'id',
        },
        inverseJoinColumn: {
          name: 'category',
          referencedColumnName: 'id',
        },
      },
    },
  },
  indices: [
    {
      name: 'IDX_POST_TITLE',
      unique: true,
      columns: ['title'],
    },
  ],
  uniques: [
    {
      name: 'UNIQUE_POST_TITLE',
      columns: ['title'],
    },
  ],
});
