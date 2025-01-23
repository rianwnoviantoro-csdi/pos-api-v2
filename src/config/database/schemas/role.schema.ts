import { BaseSchema } from 'src/commons/schemas/base.schema';
import { EntitySchema } from 'typeorm';

export interface Role {
  id: number;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;

  permissions?: any[];
}

export const RoleSchema = new EntitySchema<Role>({
  name: 'roles',
  columns: {
    ...BaseSchema,
    name: {
      type: String,
    },
    code: {
      type: String,
    },
  },
  relations: {
    permissions: {
      type: 'many-to-many',
      target: 'permissions',
      joinTable: {
        name: 'role_permissions',
        joinColumn: {
          name: 'role',
          referencedColumnName: 'id',
        },
        inverseJoinColumn: {
          name: 'permission',
          referencedColumnName: 'id',
        },
      },
    },
  },
  indices: [
    {
      name: 'IDX_ROLE_NAME',
      unique: true,
      columns: ['name'],
    },
    {
      name: 'IDX_ROLE_CODE',
      unique: true,
      columns: ['code'],
    },
  ],
  uniques: [
    {
      name: 'UNIQUE_ROLE_NAME',
      columns: ['name'],
    },
    {
      name: 'UNIQUE_ROLE_CODE',
      columns: ['code'],
    },
  ],
});
