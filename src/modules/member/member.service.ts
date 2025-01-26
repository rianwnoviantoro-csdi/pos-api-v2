import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Brackets, Connection, DeleteResult } from 'typeorm';
import {
  Member,
  MemberSchema,
} from 'src/config/database/schemas/member.schema';
import { Request } from 'express';
import { createLog, formatedDate } from 'src/commons/utils/log.util';
import { User } from 'src/config/database/schemas/user.schema';
import { BaseFilterDto } from 'src/commons/dto/base-filter.dto';

@Injectable()
export class MemberService {
  constructor(private readonly connection: Connection) {}

  async create(
    req: Request,
    createMemberDto: CreateMemberDto,
  ): Promise<Member> {
    return await this.connection.transaction(async (trx) => {
      const member = await trx.save(MemberSchema, {
        ...createMemberDto,
      });

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'MEMBER_MODULE',
        `User <b>${user.name}</b> add <b>${member.name}</b> as new member at <b>${formatedDate(new Date())}</b>.`,
        { ...createMemberDto },
      );

      return member;
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
        .getRepository(MemberSchema)
        .createQueryBuilder('member');

      if (filter.search) {
        query.andWhere(
          new Brackets((qb) => {
            qb.where('member.name ILIKE :search', {
              search: `%${filter.search}%`,
            }).orWhere('member.phone ILIKE :search', {
              search: `%${filter.search}%`,
            });
          }),
        );
      }

      const sortMapping: Record<string, string> = {
        name: 'member.name',
        phone: 'member.phone',
        point: 'member.point',
        createdAt: 'member.createdAt',
      };

      if (filter.sort && filter.order) {
        const sortColumn = sortMapping[filter.sort] || 'member.createdAt';
        const order = filter.order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        query.orderBy(sortColumn, order);
      }

      query.skip((page - 1) * limit).take(limit);

      const [members, total] = await query.getManyAndCount();

      const user: any = req.user;
      await createLog(
        this.connection,
        user,
        'MEMBER_MODULE',
        `User <b>${user.name}</b> has view member at <b>${formatedDate(new Date())}</b>.`,
        { ...filter },
      );

      return {
        data: members,
        meta: {
          total,
          page: page,
          limit: limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    });
  }

  async findOne(req: Request, id: number): Promise<Member> {
    return await this.connection.transaction(async (trx) => {
      const member = await trx.findOne(MemberSchema, {
        where: { id },
        relations: ['invoices'],
      });

      if (!member) throw new NotFoundException(`Member not found.`);

      const user: any = req.user;
      await createLog(
        this.connection,
        user,
        'MEMBER_MODULE',
        `User <b>${user.name}</b> has view member <b>${member.name}</b> at <b>${formatedDate(new Date())}</b>.`,
        member,
      );

      return member;
    });
  }

  async update(
    id: number,
    req: Request,
    updateMemberDto: UpdateMemberDto,
  ): Promise<Member> {
    return await this.connection.transaction(async (trx) => {
      const member = await this.findOne(req, id);

      await trx.save(MemberSchema, {
        ...member,
        ...updateMemberDto,
      });

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'MEMBER_MODULE',
        `User <b>${user.name}</b> update member <b>${member.name}</b> at <b>${formatedDate(new Date())}</b>.`,
        { ...updateMemberDto },
      );

      return await trx.findOne(MemberSchema, { where: { id } });
    });
  }

  async remove(id: number, req: Request): Promise<DeleteResult> {
    return await this.connection.transaction(async (trx) => {
      const member = await this.findOne(req, id);

      const user: any = req.user;

      const deletedMember = await trx.delete(MemberSchema, { id: member.id });

      await createLog(
        this.connection,
        user,
        'MEMBER_MODULE',
        `User <b>${user.name}</b> delete member <b>${member.name}</b> at <b>${formatedDate(new Date())}</b>.`,
      );

      return deletedMember;
    });
  }
}
