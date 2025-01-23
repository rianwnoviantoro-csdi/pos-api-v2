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
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/commons/guards/role.guard';
import { Permissions } from 'src/commons/decorators/role.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('write:role')
  @ApiBearerAuth()
  async create(@Req() req: Request, @Body() createRoleDto: CreateRoleDto) {
    const result = await this.roleService.create(req, createRoleDto);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('read:role')
  @ApiBearerAuth()
  async findAll() {
    const result = await this.roleService.findAll();

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('read:role')
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    const result = await this.roleService.findOne(+id);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('write:role')
  @ApiBearerAuth()
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const result = await this.roleService.update(req, +id, updateRoleDto);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('delete:role')
  @ApiBearerAuth()
  async remove(@Req() req: Request, @Param('id') id: string) {
    const result = await this.roleService.remove(req, +id);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }
}
