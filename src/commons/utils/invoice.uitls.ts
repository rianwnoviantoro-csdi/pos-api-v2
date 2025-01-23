import { BadRequestException } from '@nestjs/common';
import { InvoiceSchema } from 'src/config/database/schemas/invoice.schema';
import { Connection, Raw } from 'typeorm';

export async function generateInvoiceCode(
  connection: Connection,
  prefix = 'INV',
  cashierId: number,
  length: number,
): Promise<string> {
  return await connection.transaction(async (trx) => {
    if (!cashierId) {
      throw new BadRequestException(
        'Cashier ID is required to generate the invoice code.',
      );
    }

    let sequence: number = 0;
    const today = new Date().toISOString().slice(0, 10);

    const sequenceRecord = await trx.count(InvoiceSchema, {
      select: ['id'],
      where: {
        cashier: cashierId,
        createdAt: Raw((alias) => `DATE(${alias}) = :date`, { date: today }),
      },
    });

    sequenceRecord ? (sequence = sequenceRecord + 1) : (sequence = 1);

    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const sequencePart = sequence.toString().padStart(4, '0');

    let invoiceCode = `${prefix}/${cashierId}/${datePart}/${sequencePart}`;

    if (length && invoiceCode.length > length) {
      invoiceCode = invoiceCode.slice(0, length);
    }

    return invoiceCode;
  });
}
