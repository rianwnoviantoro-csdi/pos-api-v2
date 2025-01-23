import { BaseSchema } from 'src/commons/schemas/base.schema';
import { EntitySchema } from 'typeorm';

export interface Member {
  id: number;
  name: string;
  phone: string;
  point: number;
  createdAt: Date;
  updatedAt: Date;

  invoices?: any[];
}

export const MemberSchema = new EntitySchema<Member>({
  name: 'members',
  columns: {
    ...BaseSchema,
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    point: {
      type: Number,
      default: 0,
    },
  },
  relations: {
    invoices: {
      type: 'many-to-many',
      target: 'invoices',
      joinTable: {
        name: 'member_invoices',
        joinColumn: {
          name: 'member',
          referencedColumnName: 'id',
        },
        inverseJoinColumn: {
          name: 'invoice',
          referencedColumnName: 'id',
        },
      },
    },
  },
  indices: [
    {
      name: 'IDX_MEMBER_NAME',
      unique: true,
      columns: ['name'],
    },
    {
      name: 'IDX_MEMBER_PHONE',
      unique: true,
      columns: ['phone'],
    },
  ],
  uniques: [
    {
      name: 'UNIQUE_MEMBER_NAME',
      columns: ['name'],
    },
    {
      name: 'UNIQUE_MEMBER_PHONE',
      columns: ['phone'],
    },
  ],
});
