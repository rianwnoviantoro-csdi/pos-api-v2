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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Permissions } from 'src/commons/decorators/role.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/commons/guards/role.guard';
import { Request } from 'express';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('write:category')
  @ApiBearerAuth()
  async create(
    @Req() req: Request,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    const result = await this.categoryService.create(req, createCategoryDto);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('read:category')
  @ApiBearerAuth()
  async findAll(@Req() req: Request) {
    const result = await this.categoryService.findAll(req);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('read:category')
  @ApiBearerAuth()
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const result = await this.categoryService.findOne(req, +id);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('write:category')
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const result = await this.categoryService.update(
      +id,
      req,
      updateCategoryDto,
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
  @Permissions('delete:category')
  @ApiBearerAuth()
  async remove(@Param('id') id: string, @Req() req: Request) {
    const result = await this.categoryService.remove(req, +id);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }
}
