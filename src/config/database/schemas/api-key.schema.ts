import { BaseSchema } from 'src/commons/schemas/base.schema';
import { EntitySchema } from 'typeorm';

export interface APIKey {
  id: number;
  name: string;
  key: string;
  createdAt: Date;
  updatedAt: Date;
}

export const APIKeySchema = new EntitySchema<APIKey>({
  name: 'api_keys',
  columns: {
    ...BaseSchema,
    name: {
      type: String,
    },
    key: {
      type: String,
    },
  },
  indices: [
    {
      name: 'IDX_API_KEY_NAME',
      unique: true,
      columns: ['name'],
    },
    {
      name: 'IDX_API_KEY_KEY',
      unique: true,
      columns: ['key'],
    },
  ],
  uniques: [
    {
      name: 'UNIQUE_API_KEY_NAME',
      columns: ['name'],
    },
    {
      name: 'UNIQUE_API_KEY_KEY',
      columns: ['key'],
    },
  ],
});
