import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { APIKeySchema } from 'src/config/database/schemas/api-key.schema';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-pos-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key is missing');
    }

    const validApiKey = await this.connection
      .getRepository(APIKeySchema)
      .findOne({
        where: { key: apiKey },
      });

    if (!validApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
