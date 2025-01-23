import { Injectable, NotFoundException } from '@nestjs/common';
import { LogSchema } from 'src/config/database/schemas/log.schema';
import { Connection } from 'typeorm';

@Injectable()
export class LogService {
  constructor(private readonly connection: Connection) {}

  async findAll() {
    return await this.connection.transaction(async (trx) => {
      return await trx.find(LogSchema, {
        select: ['id', 'module', 'detail', 'createdAt', 'updatedAt'],
      });
    });
  }

  async findOne(id: number) {
    return await this.connection.transaction(async (trx) => {
      const log = await trx.find(LogSchema, {
        where: { id },
        relations: ['user', 'role'],
      });

      if (!log) throw new NotFoundException(`Log not found.`);

      return log;
    });
  }
}
