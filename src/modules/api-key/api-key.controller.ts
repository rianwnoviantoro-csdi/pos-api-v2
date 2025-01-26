import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/commons/guards/role.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Permissions } from 'src/commons/decorators/role.decorator';
import { Request } from 'express';

@Controller('api-key')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('manage:app')
  @ApiBearerAuth()
  async create(@Req() req: Request, @Body() createApiKeyDto: CreateApiKeyDto) {
    const result = await this.apiKeyService.create(req, createApiKeyDto);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('manage:app')
  @ApiBearerAuth()
  async findAll(@Req() req: Request) {
    const result = await this.apiKeyService.findAll(req);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('manage:app')
  @ApiBearerAuth()
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const result = await this.apiKeyService.findOne(req, +id);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('manage:app')
  @ApiBearerAuth()
  async remove(@Req() req: Request, @Param('id') id: string) {
    const result = await this.apiKeyService.remove(req, +id);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }
}
