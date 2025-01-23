import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Connection, DeleteResult } from 'typeorm';
import {
  Member,
  MemberSchema,
} from 'src/config/database/schemas/member.schema';
import { Request } from 'express';
import { createLog, formatedDate } from 'src/commons/utils/log.util';
import { User } from 'src/config/database/schemas/user.schema';

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

  async findAll(): Promise<Member[]> {
    return await this.connection.transaction(async (trx) => {
      return await trx.find(MemberSchema);
    });
  }

  async findOne(id: number): Promise<Member> {
    return await this.connection.transaction(async (trx) => {
      const member = await trx.findOne(MemberSchema, { where: { id } });

      if (!member) throw new NotFoundException(`Member not found.`);

      return member;
    });
  }

  async update(
    id: number,
    req: Request,
    updateMemberDto: UpdateMemberDto,
  ): Promise<Member> {
    return await this.connection.transaction(async (trx) => {
      const member = await this.findOne(id);

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
      const member = await this.findOne(id);

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
