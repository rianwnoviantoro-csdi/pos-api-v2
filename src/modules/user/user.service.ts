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
import { Connection } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User, UserSchema } from 'src/config/database/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { createLog, formatedDate } from 'src/commons/utils/log.util';
import { RoleSchema } from 'src/config/database/schemas/role.schema';

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
        `User <b>${user.name}</b> register <b>${result.name}</b> as new user with role <b>${role.name}</b> at <b>${formatedDate(new Date())}</b>.`,
        { ...result, role: role.id },
      );

      return result;
    });
  }

  async login(loginDto: LoginDto, req: Request, res: Response): Promise<any> {
    return this.connection.transaction(async (trx) => {
      const existUser = await trx.findOne(UserSchema, {
        where: { email: loginDto.email },
        relations: ['roles'],
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
        null,
        'USER_MODULE',
        `User <b>${existUser.name}</b> has been logged in at <b>${formatedDate(new Date())}</b>.`,
        { ...existUser },
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
        relations: ['roles'],
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
        `User <b>${existUser.name}</b> has request a new token at <b>${formatedDate(new Date())}</b>.`,
        existUser,
      );

      return { user: existUser, token: accessToken };
    });
  }

  async findAll(): Promise<User[]> {
    return this.connection.transaction(async (trx) => {
      return await trx.find(UserSchema, {
        select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
        relations: ['roles'],
      });
    });
  }

  async findOne(id: number): Promise<User> {
    return this.connection.transaction(async (trx) => {
      const user = await trx.findOne(UserSchema, {
        where: { id },
        relations: ['roles', 'roles.permissions'],
      });

      if (!user) throw new NotFoundException(`User not found.`);

      delete user.password;
      delete user.token;

      return user;
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await `This action updates a #${id} user`;
  }

  async remove(req: Request, id: number) {
    return this.connection.transaction(async (trx) => {
      const existUser = await this.findOne(id);

      const deletedUser = await trx.delete(UserSchema, { id: existUser.id });

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'USER_MODULE',
        `User <b>${user.name}</b> delete user <b>${existUser.name}</b> at <b>${formatedDate(new Date())}</b>.`,
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
