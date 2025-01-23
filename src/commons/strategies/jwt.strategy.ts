import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User, UserSchema } from 'src/config/database/schemas/user.schema';
import { Connection } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('access.secret'),
      passReqToCallback: true,
    });
  }

  async validate(payload: { id: number }): Promise<User> {
    try {
      return await this.connection.transaction(async (entityManager) => {
        const user = await entityManager.findOne(UserSchema, {
          where: { id: payload.id },
          relations: ['roles', 'roles.permissions'],
        });

        if (!user) {
          throw new UnauthorizedException('User not found.');
        }

        return user;
      });
    } catch (error) {
      throw new BadRequestException({
        message: 'Validation failed.',
        error: error.message || 'Unknown error occurred',
      });
    }
  }
}
