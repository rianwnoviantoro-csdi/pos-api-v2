import { BaseSchema } from 'src/commons/schemas/base.schema';
import { EntitySchema } from 'typeorm';

export interface InvoiceMenu {
  id: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;

  invoice?: any;
  menu?: any;
}

export const InvoiceMenuSchema = new EntitySchema<InvoiceMenu>({
  name: 'invoice_menues',
  columns: {
    ...BaseSchema,
    invoice: {
      type: Number,
      primary: true,
    },
    menu: {
      type: Number,
      primary: true,
    },
    quantity: {
      type: Number,
      default: 1, // Default to 1 if no amount is provided
    },
  },
  relations: {
    invoice: {
      target: 'invoices',
      type: 'many-to-one',
      joinColumn: {
        name: 'invoice',
        referencedColumnName: 'id',
      },
      onDelete: 'CASCADE',
    },
    menu: {
      target: 'recipes',
      type: 'many-to-one',
      joinColumn: {
        name: 'menu',
        referencedColumnName: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
});
