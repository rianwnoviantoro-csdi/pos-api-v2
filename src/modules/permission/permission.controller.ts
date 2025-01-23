import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/commons/guards/role.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Permissions } from 'src/commons/decorators/role.decorator';
import { Request } from 'express';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('write:permission')
  @ApiBearerAuth()
  async create(
    @Req() req: Request,
    @Body() createPermissionDto: CreatePermissionDto,
  ) {
    const result = await this.permissionService.create(
      req,
      createPermissionDto,
    );

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('read:permission')
  @ApiBearerAuth()
  async findAll() {
    const result = await this.permissionService.findAll();

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('read:permission')
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    const result = await this.permissionService.findOne(+id);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('write:permission')
  @ApiBearerAuth()
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    const result = await this.permissionService.update(
      req,
      +id,
      updatePermissionDto,
    );

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('delete:permission')
  @ApiBearerAuth()
  async remove(@Req() req: Request, @Param('id') id: string) {
    const result = await this.permissionService.remove(req, +id);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }
}
