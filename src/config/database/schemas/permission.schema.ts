import { BaseSchema } from 'src/commons/schemas/base.schema';
import { EntitySchema } from 'typeorm';

export interface Permission {
  id: number;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

export const PermissionSchema = new EntitySchema<Permission>({
  name: 'permissions',
  columns: {
    ...BaseSchema,
    name: {
      type: String,
    },
    code: {
      type: String,
    },
  },
  indices: [
    {
      name: 'IDX_PERMISSION_NAME',
      unique: true,
      columns: ['name'],
    },
    {
      name: 'IDX_PERMISSION_CODE',
      unique: true,
      columns: ['code'],
    },
  ],
  uniques: [
    {
      name: 'UNIQUE_PERMISSION_NAME',
      columns: ['name'],
    },
    {
      name: 'UNIQUE_PERMISSION_CODE',
      columns: ['code'],
    },
  ],
});
