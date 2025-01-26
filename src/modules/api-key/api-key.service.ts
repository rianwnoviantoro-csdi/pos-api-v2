import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { Connection, DeleteResult } from 'typeorm';
import {
  APIKey,
  APIKeySchema,
} from 'src/config/database/schemas/api-key.schema';
import { Request } from 'express';
import { createLog } from 'src/commons/utils/log.util';

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
        `add "${createApiKeyDto.name.toUpperCase()}" as new api key`,
      );

      return {
        ...apiKey,
        key: `${apiKey.key.slice(0, 10)}${'*'.repeat(apiKey.key.length - 4)}`,
      };
    });
  }

  async findAll(req: Request): Promise<APIKey[]> {
    return await this.connection.transaction(async (trx) => {
      const apikeys = await trx.find(APIKeySchema);

      const maskedApiKeys = apikeys.map((apiKey) => ({
        ...apiKey,
        key: `${apiKey.key.slice(0, 10)}${'*'.repeat(apiKey.key.length - 4)}`,
      }));

      const user: any = req.user;

      await createLog(this.connection, user, 'API_KEY_MODULE', `view api key`);

      return maskedApiKeys;
    });
  }

  async findOne(req: Request, id: number): Promise<APIKey> {
    return await this.connection.transaction(async (trx) => {
      const apiKey = await trx.findOne(APIKeySchema, { where: { id } });

      if (!apiKey) throw new NotFoundException(`API Key not found.`);

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'API_KEY_MODULE',
        `view api key "${apiKey.name.toUpperCase()}"`,
        {
          ...apiKey,
          key: `${apiKey.key.slice(0, 10)}${'*'.repeat(apiKey.key.length - 4)}`,
        },
      );

      return apiKey;
    });
  }

  async remove(req: Request, id: number): Promise<DeleteResult> {
    return await this.connection.transaction(async (trx) => {
      const apiKey = await this.findOne(req, id);

      if (apiKey.name === 'root')
        throw new ForbiddenException(`You can't delete root api key.`);

      const deletedApiKey = await trx.delete(APIKeySchema, { id: apiKey.id });

      const user: any = req.user;

      await createLog(
        this.connection,
        user,
        'API_KEY_MODULE',
        `delete api key "${apiKey.name.toUpperCase()}"`,
      );

      return deletedApiKey;
    });
  }

  private generateRandomKey(): string {
    return [...Array(128)].map(() => Math.random().toString(36)[2]).join('');
  }
}
