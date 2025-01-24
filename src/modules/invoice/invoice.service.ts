import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Brackets, Connection } from 'typeorm';
import {
  Invoice,
  InvoiceSchema,
} from 'src/config/database/schemas/invoice.schema';
import { generateInvoiceCode } from 'src/commons/utils/invoice.uitls';
import { StockSchema } from 'src/config/database/schemas/stock.schema';
import { RecipeSchema } from 'src/config/database/schemas/recipe.schema';
import { MemberSchema } from 'src/config/database/schemas/member.schema';
import { Request } from 'express';
import { createLog, formatedDate } from 'src/commons/utils/log.util';
import { FilterInvoiceDto } from './dto/filter-invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(private readonly connection: Connection) {}

  async create(
    req: Request,
    createInvoiceDto: CreateInvoiceDto,
  ): Promise<Invoice> {
    return await this.connection.transaction(async (trx) => {
      const user: any = req.user;
      const { menus, ...invoiceData } = createInvoiceDto;

      const member = await trx.findOne(MemberSchema, {
        where: [
          { phone: invoiceData.customer },
          { name: invoiceData.customer },
        ],
      });

      const invoice = await trx.save(InvoiceSchema, {
        ...invoiceData,
        customer: member ? member.name : invoiceData.customer,
        code: await generateInvoiceCode(this.connection, 'INV', user.id, 20),
      });

      if (member) {
        await trx
          .createQueryBuilder()
          .insert()
          .into('member_invoices')
          .values({
            member: member,
            invoice: invoice,
          })
          .execute();

        if (invoiceData.payment === 'point') {
          if (member.point < invoiceData.amount) {
            throw new BadRequestException(`Not enough point.`);
          }

          await trx.save(MemberSchema, {
            ...member,
            point: member.point - invoiceData.amount,
          });
        } else if (
          invoiceData.payment === 'cash' ||
          invoiceData.payment === 'qris' ||
          invoiceData.payment === 'card'
        ) {
          const pointsToAdd = Math.floor((10 / 100) * invoiceData.amount);

          await trx.save(MemberSchema, {
            ...member,
            point: member.point + pointsToAdd,
          });
        }
      }

      const menuQuantities = menus.reduce((acc, menu) => {
        if (acc[menu.id]) {
          acc[menu.id] += 1;
        } else {
          acc[menu.id] = 1;
        }
        return acc;
      }, {});

      const invoiceMenus = Object.entries(menuQuantities).map(
        ([menuId, amount]) => ({
          invoice: invoice,
          menu: parseInt(menuId),
          quantity: amount,
        }),
      );

      await trx
        .createQueryBuilder()
        .insert()
        .into('invoice_menues')
        .values(invoiceMenus)
        .execute();

      for (const menu of menus) {
        const recipe = await trx.findOne(RecipeSchema, {
          where: { id: menu.id },
          relations: ['ingredients.ingredient'],
        });

        if (!recipe) {
          throw new NotFoundException(
            `Recipe not found for menu ID: ${menu.id}`,
          );
        }

        for (const ingredient of recipe.ingredients) {
          const stock = await trx.findOne(StockSchema, {
            where: { id: ingredient.ingredient.id },
          });

          if (!stock) {
            throw new NotFoundException(
              `Stock not found for ingredient ID: ${ingredient.id}`,
            );
          }

          const newAmount = stock.amount - ingredient.amount;

          if (newAmount < 0) {
            throw new BadRequestException(
              `Not enough stock for ingredient ID: ${ingredient.id}`,
            );
          }

          await trx
            .createQueryBuilder()
            .update('stocks')
            .set({ amount: newAmount })
            .where('id = :id', { id: ingredient.ingredient.id })
            .execute();
        }
      }

      await createLog(
        this.connection,
        user,
        'INVOICE_MODULE',
        `User <b>${user.name}</b> add <b>${invoice.code}</b> as new invoice at <b>${formatedDate(new Date())}</b>.`,
        { ...createInvoiceDto },
      );

      return invoice;
    });
  }

  async findAll(filter: FilterInvoiceDto): Promise<Record<string, any>> {
    return await this.connection.transaction(async (trx) => {
      const page = Number(filter.page) || 1;
      const limit = Number(filter.limit) || 10;

      const query = trx
        .getRepository(InvoiceSchema)
        .createQueryBuilder('invoice')
        .leftJoinAndSelect('invoice.cashier', 'cashier')
        .select([
          'invoice.id',
          'invoice.code',
          'invoice.customer',
          'invoice.amount',
          'invoice.payment',
          'cashier.id',
          'cashier.name',
          'invoice.createdAt',
          'invoice.updatedAt',
        ]);

      if (filter.search) {
        query.andWhere(
          new Brackets((qb) => {
            qb.where('invoice.code ILIKE :search', {
              search: `%${filter.search}%`,
            })
              .orWhere('invoice.customer ILIKE :search', {
                search: `%${filter.search}%`,
              })
              .orWhere('cashier.name ILIKE :search', {
                search: `%${filter.search}%`,
              });
          }),
        );
      }

      if (filter.cashierId) {
        query.andWhere('cashier.id = :cashierId', {
          cashierId: filter.cashierId,
        });
      }

      if (filter.customer) {
        query.andWhere('LOWER(invoice.customer) = :customerName', {
          customerName: filter.customer.toLowerCase(),
        });
      }

      const sortMapping: Record<string, string> = {
        code: 'invoice.code',
        cashier: 'invoice.cashier',
        customer: 'invoice.customer',
        amount: 'invoice.amount',
        createdAt: 'invoice.createdAt',
      };

      if (filter.sort && filter.order) {
        const sortColumn = sortMapping[filter.sort] || 'invoice.createdAt';
        const order = filter.order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        query.orderBy(sortColumn, order);
      }

      query.skip((page - 1) * limit).take(limit);

      const [invoices, total] = await query.getManyAndCount();

      return {
        data: invoices,
        meta: {
          total,
          page: page,
          limit: limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    });
  }

  async findOne(id: number): Promise<Invoice> {
    return await this.connection.transaction(async (trx) => {
      const invoice = await trx.findOne(InvoiceSchema, {
        where: { id: id },
        relations: ['cashier', 'cashier.roles', 'menus.menu'],
      });

      if (!invoice) throw new NotFoundException(`Invoice not found.`);

      delete invoice.cashier.password;
      delete invoice.cashier.token;

      return invoice;
    });
  }
}
