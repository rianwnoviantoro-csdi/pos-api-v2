import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Connection, DeleteResult } from 'typeorm';
import { Stock, StockSchema } from 'src/config/database/schemas/stock.schema';
import { Request } from 'express';
import { createLog, formatedDate } from 'src/commons/utils/log.util';

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

  async findAll(): Promise<Stock[]> {
    return await this.connection.transaction(async (trx) => {
      return await trx.find(StockSchema);
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
