import { Injectable, NotFoundException } from '@nestjs/common';
import { LogSchema } from 'src/config/database/schemas/log.schema';
import { Brackets, Connection } from 'typeorm';
import { FilterLogDto } from './dto/filter-log.dto';

@Injectable()
export class LogService {
  constructor(private readonly connection: Connection) {}

  async findAll(filter: FilterLogDto): Promise<Record<string, any>> {
    return await this.connection.transaction(async (trx) => {
      const page = Number(filter.page) || 1;
      const limit = Number(filter.limit) || 10;

      const query = trx
        .getRepository(LogSchema)
        .createQueryBuilder('log')
        .leftJoinAndSelect('log.user', 'user')
        .leftJoinAndSelect('log.role', 'role')
        .select([
          'log.id',
          'log.module',
          'log.detail',
          'log.createdAt',
          'log.updatedAt',
          'user.id',
          'user.name',
          'role.id',
          'role.name',
        ]);

      if (filter.search) {
        query.andWhere(
          new Brackets((qb) => {
            qb.where('log.detail ILIKE :search', {
              search: `%${filter.search}%`,
            })
              .orWhere('log.module ILIKE :search', {
                search: `%${filter.search}%`,
              })
              .orWhere('user.name ILIKE :search', {
                search: `%${filter.search}%`,
              })
              .orWhere('role.name ILIKE :search', {
                search: `%${filter.search}%`,
              });
          }),
        );
      }

      if (filter.module) {
        query.andWhere('LOWER(log.module) = :module', {
          module: filter.module.toLowerCase(),
        });
      }

      if (filter.userId) {
        query.andWhere('user.id = :userId', {
          userId: filter.userId,
        });
      }

      if (filter.roleId) {
        query.andWhere('role.id = :roleId', {
          roleId: filter.roleId,
        });
      }

      const sortMapping: Record<string, string> = {
        module: 'log.module',
        detail: 'log.detail',
        user: 'user.name',
        role: 'role.name',
        createdAt: 'log.createdAt',
      };

      if (filter.sort && filter.order) {
        const sortColumn = sortMapping[filter.sort] || 'log.createdAt';
        const order = filter.order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        query.orderBy(sortColumn, order);
      }

      query.skip((page - 1) * limit).take(limit);

      const [logs, total] = await query.getManyAndCount();

      return {
        data: logs,
        meta: {
          total,
          page: page,
          limit: limit,
          totalPages: Math.ceil(total / limit),
        },
      };
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
