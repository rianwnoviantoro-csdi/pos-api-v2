import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Brackets, Connection } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User, UserSchema } from 'src/config/database/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { createLog } from 'src/commons/utils/log.util';
import { RoleSchema } from 'src/config/database/schemas/role.schema';
import { FilterInvoiceDto } from './dto/filter-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly connection: Connection,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(req: Request, createUserDto: CreateUserDto): Promise<any> {
    return await this.connection.transaction(async (trx) => {
      const existEmail = await trx.findOne(UserSchema, {
        where: { email: createUserDto.email },
      });

      if (existEmail) throw new ConflictException(`Email already exist.`);

      const role = await trx.findOne(RoleSchema, {
        where: { id: createUserDto.role },
      });

      if (!role) throw new NotFoundException(`Role not found.`);

      const hashPassword = await bcrypt.hash(createUserDto.password, 10);

      const newUser = await trx.save(UserSchema, {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashPassword,
      });

      await trx
        .createQueryBuilder()
        .insert()
        .into('user_roles')
        .values({ user: newUser, role: role })
        .execute();

      const { password, ...result } = newUser;

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'USER_MODULE',
        `register "${result.name.toUpperCase()}" as new user with role "${role.name.toUpperCase()}"`,
        { ...result, role: role.id },
      );

      return result;
    });
  }

  async login(loginDto: LoginDto, req: Request, res: Response): Promise<any> {
    return this.connection.transaction(async (trx) => {
      const existUser: User = await trx.findOne(UserSchema, {
        where: { email: loginDto.email },
        relations: ['roles', 'roles.permissions'],
      });

      if (!existUser) {
        throw new NotFoundException(`User doesn't exist.`);
      }

      const isRightPassword = await bcrypt.compare(
        loginDto.password,
        existUser.password,
      );

      if (!isRightPassword) {
        throw new BadRequestException(`Invalid credentials. Failed login.`);
      }

      const accessToken = this.jwtService.sign({
        id: existUser.id,
        email: existUser.email,
        name: existUser.name,
      });

      const newRefreshToken = this.generateRefreshToken({
        id: existUser.id,
        email: existUser.email,
        name: existUser.name,
      });

      res.cookie('jwt', newRefreshToken, {
        httpOnly: true,
      });

      await trx.save(UserSchema, { ...existUser, token: newRefreshToken });

      delete existUser.password;
      delete existUser.token;

      await createLog(
        this.connection,
        existUser.name,
        'USER_MODULE',
        `been logged in`,
        {
          ...existUser,
        },
      );

      return { user: existUser, token: accessToken };
    });
  }

  async refreshToken(req: Request, res: Response): Promise<any> {
    return this.connection.transaction(async (trx) => {
      const cookies = req.cookies;

      if (!cookies?.jwt) {
        throw new UnauthorizedException('No token provided.', null);
      }

      const refreshToken = cookies.jwt;

      res.clearCookie('jwt', { httpOnly: true });

      const existUser = await trx.findOne(UserSchema, {
        where: { token: refreshToken },
        relations: ['roles', 'roles.permissions'],
      });

      if (!existUser) {
        const decodedToken = this.jwtService.decode(refreshToken);

        await trx.update(UserSchema, decodedToken.id, {
          token: null,
        });

        throw new ForbiddenException(`Forbidden.`);
      }

      const accessToken = this.jwtService.sign({
        id: existUser.id,
        email: existUser.email,
        name: existUser.name,
      });

      const newRefreshToken = this.generateRefreshToken({
        id: existUser.id,
        email: existUser.email,
        name: existUser.name,
      });

      if (cookies?.jwt) {
        res.clearCookie('jwt', {
          httpOnly: true,
        });
      }

      await trx.save(UserSchema, {
        id: existUser.id,
        token: newRefreshToken,
      });

      res.cookie('jwt', newRefreshToken, {
        httpOnly: true,
      });

      delete existUser.password;
      delete existUser.token;

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'USER_MODULE',
        `has request a new token`,
        existUser,
      );

      return { user: existUser, token: accessToken };
    });
  }

  async findAll(
    req: Request,
    filter: FilterInvoiceDto,
  ): Promise<Record<string, any>> {
    return this.connection.transaction(async (trx) => {
      const page = Number(filter.page) || 1;
      const limit = Number(filter.limit) || 10;

      const query = trx
        .getRepository(UserSchema)
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'roles')
        .select([
          'user.id',
          'user.name',
          'user.email',
          'roles.id',
          'roles.name',
          'roles.code',
          'user.createdAt',
          'user.updatedAt',
        ]);

      if (filter.search) {
        query.andWhere(
          new Brackets((qb) => {
            qb.where('user.name ILIKE :search', {
              search: `%${filter.search}%`,
            })
              .orWhere('user.email ILIKE :search', {
                search: `%${filter.search}%`,
              })
              .orWhere('roles.name ILIKE :search', {
                search: `%${filter.search}%`,
              })
              .orWhere('roles.code ILIKE :search', {
                search: `%${filter.search}%`,
              });
          }),
        );
      }

      if (filter.roleId) {
        query.andWhere('roles.id = :roleId', {
          roleId: filter.roleId,
        });
      }

      const sortMapping: Record<string, string> = {
        name: 'user.name',
        email: 'user.email',
        role: 'roles.name',
        createdAt: 'user.createdAt',
      };

      if (filter.sort && filter.order) {
        const sortColumn = sortMapping[filter.sort] || 'user.createdAt';
        const order = filter.order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        query.orderBy(sortColumn, order);
      }

      query.skip((page - 1) * limit).take(limit);

      const [users, total] = await query.getManyAndCount();

      const user: any = req.user;
      await createLog(this.connection, user, 'USER_MODULE', `view user`, {
        ...filter,
      });

      return {
        data: users,
        meta: {
          total,
          page: page,
          limit: limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    });
  }

  async findOne(req: Request, id: number): Promise<User> {
    return this.connection.transaction(async (trx) => {
      const user = await trx.findOne(UserSchema, {
        where: { id },
        relations: ['roles', 'roles.permissions'],
      });

      if (!user) throw new NotFoundException(`User not found.`);

      delete user.password;
      delete user.token;

      const ReqUser: any = req.user;
      await createLog(
        this.connection,
        ReqUser,
        'USER_MODULE',
        `view user "${user.name.toUpperCase()}"`,
        user,
      );

      return user;
    });
  }

  async update(req: Request, id: number, updateUserDto: UpdateUserDto) {
    return await `This action updates a #${id} user`;
  }

  async remove(req: Request, id: number) {
    return this.connection.transaction(async (trx) => {
      const existUser = await this.findOne(req, id);

      const deletedUser = await trx.delete(UserSchema, { id: existUser.id });

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'USER_MODULE',
        `delete user "${existUser.name.toUpperCase()}"`,
      );

      return deletedUser;
    });
  }

  generateRefreshToken(payload: {
    id: number;
    email: string;
    name: string;
  }): string {
    const refreshTokenService = new JwtService({
      secret: this.configService.get<string>('refresh.secret'),
    });

    return refreshTokenService.sign(payload, {
      expiresIn: this.configService.get<string>('refresh.expires'),
    });
  }
}
