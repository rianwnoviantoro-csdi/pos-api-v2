import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Brackets, Connection, DeleteResult } from 'typeorm';
import {
  Permission,
  PermissionSchema,
} from 'src/config/database/schemas/permission.schema';
import { Request } from 'express';
import { createLog } from 'src/commons/utils/log.util';
import { BaseFilterDto } from 'src/commons/dto/base-filter.dto';

@Injectable()
export class PermissionService {
  constructor(private readonly connection: Connection) {}

  async create(
    req: Request,
    createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    return await this.connection.transaction(async (trx) => {
      const { role, ...PermissionData } = createPermissionDto;

      const permission = await trx.save(PermissionSchema, {
        ...PermissionData,
      });

      if (role) {
        await trx
          .createQueryBuilder()
          .insert()
          .into('role_permissions')
          .values({
            permission: permission,
            role: role,
          })
          .execute();
      }

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'PERMISSION_MODULE',
        `add "${permission.name.toUpperCase()}" as new permission`,
        { ...createPermissionDto },
      );

      return permission;
    });
  }

  async findAll(
    req: Request,
    filter: BaseFilterDto,
  ): Promise<Record<string, any>> {
    return await this.connection.transaction(async (trx) => {
      const page = Number(filter.page) || 1;
      const limit = Number(filter.limit) || 10;

      const query = trx
        .getRepository(PermissionSchema)
        .createQueryBuilder('permission');

      if (filter.search) {
        query.andWhere(
          new Brackets((qb) => {
            qb.where('permission.name ILIKE :search', {
              search: `%${filter.search}%`,
            }).orWhere('permission.code ILIKE :search', {
              search: `%${filter.search}%`,
            });
          }),
        );
      }

      const sortMapping: Record<string, string> = {
        name: 'permission.name',
        createdAt: 'permission.createdAt',
      };

      if (filter.sort && filter.order) {
        const sortColumn = sortMapping[filter.sort] || 'permission.createdAt';
        const order = filter.order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        query.orderBy(sortColumn, order);
      }

      query.skip((page - 1) * limit).take(limit);

      const [permissions, total] = await query.getManyAndCount();

      const user: any = req.user;
      await createLog(this.connection, user, 'PERMISSION_MODULE', `has view`, {
        ...filter,
      });

      return {
        data: permissions,
        meta: {
          total,
          page: page,
          limit: limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    });
  }

  async findOne(req: Request, id: number): Promise<Permission> {
    return await this.connection.transaction(async (trx) => {
      const permission = await trx.findOne(PermissionSchema, {
        where: { id },
      });

      if (!permission) throw new NotFoundException(`Permission not found.`);

      const user: any = req.user;
      await createLog(
        this.connection,
        user,
        'PERMISSION_MODULE',
        `view permission "${permission.name.toUpperCase()}"`,
        permission,
      );

      return permission;
    });
  }

  async update(
    req: Request,
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    return await this.connection.transaction(async (trx) => {
      const permission = await this.findOne(req, id);

      const { role, ...PermissionData } = updatePermissionDto;

      await trx.save(PermissionSchema, {
        ...permission,
        ...PermissionData,
      });

      if (role) {
        await trx
          .createQueryBuilder()
          .delete()
          .from('role_permissions')
          .where('role = :id', { id: role })
          .execute();

        await trx
          .createQueryBuilder()
          .insert()
          .into('role_permissions')
          .values({
            permission: permission,
            role: role,
          })
          .execute();
      }

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'PERMISSION_MODULE',
        `update permission "${permission.name.toUpperCase()}"`,
        { ...updatePermissionDto },
      );

      return await trx.findOne(PermissionSchema, {
        where: { id },
      });
    });
  }

  async remove(req: Request, id: number): Promise<DeleteResult> {
    return await this.connection.transaction(async (trx) => {
      const permission = await this.findOne(req, id);

      const deletedPermission = await trx.delete(PermissionSchema, {
        id: permission.id,
      });

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'PERMISSION_MODULE',
        `delete permission "${permission.name.toUpperCase().toUpperCase()}"`,
      );

      return deletedPermission;
    });
  }
}
