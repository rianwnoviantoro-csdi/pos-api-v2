import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Brackets, Connection, DeleteResult } from 'typeorm';
import { Stock, StockSchema } from 'src/config/database/schemas/stock.schema';
import { Request } from 'express';
import { createLog, formatedDate } from 'src/commons/utils/log.util';
import { BaseFilterDto } from 'src/commons/dto/base-filter.dto';

@Injectable()
export class StockService {
  constructor(private readonly connection: Connection) {}

  async create(req: Request, createStockDto: CreateStockDto): Promise<Stock> {
    return await this.connection.transaction(async (trx) => {
      const stock = await trx.save(StockSchema, {
        ...createStockDto,
      });

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'STOCK_MODULE',
        `User <b>${user.name}</b> add <b>${stock.name}</b> as new stock at <b>${formatedDate(new Date())}</b>.`,
        { ...createStockDto },
      );

      return stock;
    });
  }

  async findAll(filter: BaseFilterDto): Promise<Record<string, any>> {
    return await this.connection.transaction(async (trx) => {
      const page = Number(filter.page) || 1;
      const limit = Number(filter.limit) || 10;

      const query = trx.getRepository(StockSchema).createQueryBuilder('stock');

      if (filter.search) {
        query.andWhere(
          new Brackets((qb) => {
            qb.where('stock.name ILIKE :search', {
              search: `%${filter.search}%`,
            });
          }),
        );
      }

      const sortMapping: Record<string, string> = {
        name: 'stock.name',
        amount: 'stock.amount',
        createdAt: 'stock.createdAt',
      };

      if (filter.sort && filter.order) {
        const sortColumn = sortMapping[filter.sort] || 'stock.createdAt';
        const order = filter.order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        query.orderBy(sortColumn, order);
      }

      query.skip((page - 1) * limit).take(limit);

      const [stocks, total] = await query.getManyAndCount();

      return {
        data: stocks,
        meta: {
          total,
          page: page,
          limit: limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    });
  }

  async findOne(id: number): Promise<Stock> {
    return await this.connection.transaction(async (trx) => {
      const stock = await trx.findOne(StockSchema, { where: { id } });

      if (!stock) throw new NotFoundException(`Stock not found.`);

      return stock;
    });
  }

  async update(
    req: Request,
    id: number,
    updateStockDto: UpdateStockDto,
  ): Promise<Stock> {
    return await this.connection.transaction(async (trx) => {
      const stock = await this.findOne(id);

      await trx.save(StockSchema, {
        ...stock,
        ...updateStockDto,
      });

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'STOCK_MODULE',
        `User <b>${user.name}<b/> update stock <b>${stock.name}</b> at <b>${formatedDate(new Date())}</b>.`,
        { ...updateStockDto },
      );

      return trx.findOne(StockSchema, { where: { id: stock.id } });
    });
  }

  async remove(req: Request, id: number): Promise<DeleteResult> {
    return await this.connection.transaction(async (trx) => {
      const stock = await this.findOne(id);

      const deletedStock = await trx.delete(StockSchema, { id: stock.id });

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'STOCK_MODULE',
        `User <b>${user.name}</b> delete stock <b>${stock.name}</b> at <b>${formatedDate(new Date())}</b>.`,
      );

      return deletedStock;
    });
  }
}
