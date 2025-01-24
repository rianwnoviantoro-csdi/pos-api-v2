import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { Connection, DeleteResult } from 'typeorm';
import {
  APIKey,
  APIKeySchema,
} from 'src/config/database/schemas/api-key.schema';
import { Request } from 'express';
import { createLog, formatedDate } from 'src/commons/utils/log.util';

@Injectable()
export class ApiKeyService {
  constructor(private readonly connection: Connection) {}

  async create(req: Request, createApiKeyDto: CreateApiKeyDto) {
    return await this.connection.transaction(async (trx) => {
      const newKey = this.generateRandomKey();

      const apiKey = await trx.save(APIKeySchema, {
        ...createApiKeyDto,
        key: newKey,
      });

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'API_KEY_MODULE',
        `User <b>${user.name}</b> add <b>${createApiKeyDto.name}</b> as new api key at <b>${formatedDate(new Date())}</b>.`,
      );

      return {
        ...apiKey,
        key: `${apiKey.key.slice(0, 10)}${'*'.repeat(apiKey.key.length - 4)}`,
      };
    });
  }

  async findAll(): Promise<APIKey[]> {
    return await this.connection.transaction(async (trx) => {
      const apikeys = await trx.find(APIKeySchema);

      const maskedApiKeys = apikeys.map((apiKey) => ({
        ...apiKey,
        key: `${apiKey.key.slice(0, 10)}${'*'.repeat(apiKey.key.length - 4)}`,
      }));

      return maskedApiKeys;
    });
  }

  async findOne(id: number): Promise<APIKey> {
    return await this.connection.transaction(async (trx) => {
      const apiKey = await trx.findOne(APIKeySchema, { where: { id } });

      if (!apiKey) throw new NotFoundException(`API Key not found.`);

      return apiKey;
    });
  }

  async remove(req: Request, id: number): Promise<DeleteResult> {
    return await this.connection.transaction(async (trx) => {
      const apiKey = await this.findOne(id);

      if (apiKey.name === 'root')
        throw new ForbiddenException(`You can't delete root api key.`);

      const deletedApiKey = await trx.delete(APIKeySchema, { id: apiKey.id });

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'API_KEY_MODULE',
        `User <b>${user.name}</b> delete api key <b>${apiKey.name}</b> at <b>${formatedDate(new Date())}</b>.`,
      );

      return deletedApiKey;
    });
  }

  private generateRandomKey(): string {
    return [...Array(128)].map(() => Math.random().toString(36)[2]).join('');
  }
}
