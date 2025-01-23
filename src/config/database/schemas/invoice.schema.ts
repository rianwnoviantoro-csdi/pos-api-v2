import { BaseSchema } from 'src/commons/schemas/base.schema';
import { EntitySchema } from 'typeorm';

export interface Invoice {
  id: number;
  code: string;
  customer?: string;
  amount: number;
  payment: string;
  createdAt: Date;
  updatedAt: Date;

  menus?: any[];
  cashier?: any;
}

export const InvoiceSchema = new EntitySchema<Invoice>({
  name: 'invoices',
  columns: {
    ...BaseSchema,
    code: {
      type: String,
    },
    customer: {
      type: String,
    },
    amount: {
      type: Number,
    },
    payment: {
      type: String,
      nullable: true,
    },
  },
  relations: {
    menus: {
      type: 'one-to-many',
      target: 'invoice_menues',
      inverseSide: 'invoice',
    },
    cashier: {
      type: 'many-to-one',
      target: 'users',
      joinColumn: { name: 'cashier' },
      nullable: true,
      onDelete: 'SET NULL',
    },
  },
  indices: [
    {
      name: 'IDX_INVOICE_CODE',
      unique: true,
      columns: ['code'],
    },
    {
      name: 'IDX_INVOICE_CASHIER',
      unique: false,
      columns: ['cashier'],
    },
  ],
  uniques: [
    {
      name: 'UNIQUE_INVOICE_CODE',
      columns: ['code'],
    },
  ],
});
