import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Connection, DeleteResult } from 'typeorm';
import {
  Permission,
  PermissionSchema,
} from 'src/config/database/schemas/permission.schema';
import { Request } from 'express';
import { createLog, formatedDate } from 'src/commons/utils/log.util';

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
        `User <b>${user.name}</b> add <b>${permission.name}</b> as new permission at <b>${formatedDate(new Date())}</b>.`,
        { ...createPermissionDto },
      );

      return permission;
    });
  }

  async findAll(): Promise<Permission[]> {
    return await this.connection.transaction(async (trx) => {
      return await trx.find(PermissionSchema);
    });
  }

  async findOne(id: number): Promise<Permission> {
    return await this.connection.transaction(async (trx) => {
      const permission = await trx.findOne(PermissionSchema, {
        where: { id },
      });

      if (!permission) throw new NotFoundException(`Permission not found.`);

      return permission;
    });
  }

  async update(
    req: Request,
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    return await this.connection.transaction(async (trx) => {
      const permission = await this.findOne(id);

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
        `User <b>${user.name}<b/> update permission <b>${permission.name}</b> at <b>${formatedDate(new Date())}</b>.`,
        { ...updatePermissionDto },
      );

      return await trx.findOne(PermissionSchema, {
        where: { id },
      });
    });
  }

  async remove(req: Request, id: number): Promise<DeleteResult> {
    return await this.connection.transaction(async (trx) => {
      const permission = await this.findOne(id);

      const deletedPermission = await trx.delete(PermissionSchema, {
        id: permission.id,
      });

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'PERMISSION_MODULE',
        `User <b>${user.name}</b> delete permission <b>${permission.name}</b> at <b>${formatedDate(new Date())}</b>.`,
      );

      return deletedPermission;
    });
  }
}
