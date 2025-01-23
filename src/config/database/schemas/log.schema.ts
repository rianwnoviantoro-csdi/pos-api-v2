import { BaseSchema } from 'src/commons/schemas/base.schema';
import { EntitySchema } from 'typeorm';

export interface Log {
  id: number;
  module: string;
  detail: string;
  additionalInfo: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  user?: any;
  role?: any;
}

export const LogSchema = new EntitySchema<Log>({
  name: 'logs',
  columns: {
    ...BaseSchema,
    module: {
      type: String,
    },
    detail: {
      type: String,
    },
    additionalInfo: {
      name: 'additional_info',
      type: 'json',
      nullable: true,
    },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'users',
      joinColumn: { name: 'user' },
      nullable: true,
      onDelete: 'SET NULL',
    },
    role: {
      type: 'many-to-one',
      target: 'roles',
      joinColumn: { name: 'role' },
      nullable: true,
      onDelete: 'SET NULL',
    },
  },
  indices: [
    {
      name: 'IDX_LOG_MODULE',
      unique: false,
      columns: ['module'],
    },
    {
      name: 'IDX_LOG_USER',
      unique: false,
      columns: ['user'],
    },
    {
      name: 'IDX_LOG_ROLE',
      unique: false,
      columns: ['role'],
    },
  ],
});
