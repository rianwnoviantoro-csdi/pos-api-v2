import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Brackets, Connection, DeleteResult } from 'typeorm';
import { Role, RoleSchema } from 'src/config/database/schemas/role.schema';
import { Request } from 'express';
import { createLog, formatedDate } from 'src/commons/utils/log.util';
import { BaseFilterDto } from 'src/commons/dto/base-filter.dto';

@Injectable()
export class RoleService {
  constructor(private readonly connection: Connection) {}

  async create(req: Request, createRoleDto: CreateRoleDto): Promise<Role> {
    return await this.connection.transaction(async (trx) => {
      const { permissions, ...roleData } = createRoleDto;

      const role = await trx.save(RoleSchema, {
        ...roleData,
      });

      if (permissions && permissions.length > 0) {
        const newPermissions = permissions.map((item) => ({
          role: role,
          permission: { id: item.id },
        }));

        await trx
          .createQueryBuilder()
          .insert()
          .into('role_permissions')
          .values(newPermissions)
          .execute();
      }

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'ROLE_MODULE',
        `User <b>${user.name}</b> add <b>${role.name}</b> as new role at <b>${formatedDate(new Date())}</b>.`,
        { ...createRoleDto },
      );

      return role;
    });
  }

  async findAll(
    req: Request,
    filter: BaseFilterDto,
  ): Promise<Record<string, any>> {
    return await this.connection.transaction(async (trx) => {
      const page = Number(filter.page) || 1;
      const limit = Number(filter.limit) || 10;

      const query = trx.getRepository(RoleSchema).createQueryBuilder('role');

      if (filter.search) {
        query.andWhere(
          new Brackets((qb) => {
            qb.where('role.name ILIKE :search', {
              search: `%${filter.search}%`,
            }).orWhere('role.code ILIKE :search', {
              search: `%${filter.search}%`,
            });
          }),
        );
      }

      const sortMapping: Record<string, string> = {
        name: 'role.name',
        createdAt: 'role.createdAt',
      };

      if (filter.sort && filter.order) {
        const sortColumn = sortMapping[filter.sort] || 'role.createdAt';
        const order = filter.order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        query.orderBy(sortColumn, order);
      }

      query.skip((page - 1) * limit).take(limit);

      const [roles, total] = await query.getManyAndCount();

      const user: any = req.user;
      await createLog(
        this.connection,
        user,
        'ROLE_MODULE',
        `User <b>${user.name}</b> has view role at <b>${formatedDate(new Date())}</b>.`,
        { ...filter },
      );

      return {
        data: roles,
        meta: {
          total,
          page: page,
          limit: limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    });
  }

  async findOne(req: Request, id: number): Promise<Role> {
    return await this.connection.transaction(async (trx) => {
      const role = await trx.findOne(RoleSchema, {
        where: { id },
        relations: ['permissions'],
      });

      if (!role) throw new NotFoundException(`Role not found.`);

      const user: any = req.user;
      await createLog(
        this.connection,
        user,
        'ROLE_MODULE',
        `User <b>${user.name}</b> has view role <b>${role.name}</b> at <b>${formatedDate(new Date())}</b>.`,
        role,
      );

      return role;
    });
  }

  async update(
    req: Request,
    id: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    return await this.connection.transaction(async (trx) => {
      const role = await this.findOne(req, id);

      const { permissions, ...roleData } = updateRoleDto;

      await trx.save(RoleSchema, {
        ...role,
        ...roleData,
      });

      if (permissions && permissions.length > 0) {
        const newPermissions = permissions.map((item) => ({
          role: role,
          permission: { id: item.id },
        }));

        await trx
          .createQueryBuilder()
          .delete()
          .from('role_permissions')
          .where('role = :id', { id: role.id })
          .execute();

        await trx
          .createQueryBuilder()
          .insert()
          .into('role_permissions')
          .values(newPermissions)
          .execute();
      }

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'ROLE_MODULE',
        `User <b>${user.name}<b/> update role <b>${role.name}</b> at <b>${formatedDate(new Date())}</b>.`,
        { ...updateRoleDto },
      );

      return await trx.findOne(RoleSchema, {
        where: { id },
        relations: ['permissions'],
      });
    });
  }

  async remove(req: Request, id: number): Promise<DeleteResult> {
    return await this.connection.transaction(async (trx) => {
      const role = await this.findOne(req, id);

      const deletedRole = await trx.delete(RoleSchema, { id: role.id });

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'ROLE_MODULE',
        `User <b>${user.name}</b> delete role <b>${role.name}</b> at <b>${formatedDate(new Date())}</b>.`,
      );

      return deletedRole;
    });
  }
}
