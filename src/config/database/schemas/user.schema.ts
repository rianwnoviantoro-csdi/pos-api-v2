import { BaseSchema } from 'src/commons/schemas/base.schema';
import { EntitySchema } from 'typeorm';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  token?: string;
  createdAt: Date;
  updatedAt: Date;

  roles?: any[];
}

export const UserSchema = new EntitySchema<User>({
  name: 'users',
  columns: {
    ...BaseSchema,
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    token: {
      type: String,
      nullable: true,
    },
  },
  relations: {
    roles: {
      type: 'many-to-many',
      target: 'roles',
      joinTable: {
        name: 'user_roles',
        joinColumn: {
          name: 'user',
          referencedColumnName: 'id',
        },
        inverseJoinColumn: {
          name: 'role',
          referencedColumnName: 'id',
        },
      },
    },
  },
  indices: [
    {
      name: 'IDX_USER_NAME',
      unique: true,
      columns: ['name'],
    },
    {
      name: 'IDX_USER_EMAIL',
      unique: true,
      columns: ['email'],
    },
    {
      name: 'IDX_USER_TOKEN',
      unique: true,
      columns: ['token'],
    },
  ],
  uniques: [
    {
      name: 'UNIQUE_USER_NAME',
      columns: ['name'],
    },
    {
      name: 'UNIQUE_USER_EMAIL',
      columns: ['email'],
    },
    {
      name: 'UNIQUE_USER_TOKEN',
      columns: ['token'],
    },
  ],
});
