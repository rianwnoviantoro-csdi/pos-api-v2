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
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/commons/guards/role.guard';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Permissions } from 'src/commons/decorators/role.decorator';
import { Request } from 'express';
import { FilterRecipeDto } from './dto/filter-recipe.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('write:recipe')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  async create(
    @Req() req: Request,
    @Body() createRecipeDto: CreateRecipeDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.recipeService.create(req, createRecipeDto, file);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('read:recipe')
  @ApiBearerAuth()
  async findAll(@Req() req: Request, @Query() filter: FilterRecipeDto) {
    const { data, meta } = await this.recipeService.findAll(req, filter);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data,
      meta,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('read:recipe')
  @ApiBearerAuth()
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const result = await this.recipeService.findOne(req, +id);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('write:recipe')
  @ApiBearerAuth()
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    const result = await this.recipeService.update(req, +id, updateRecipeDto);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('delete:recipe')
  @ApiBearerAuth()
  async remove(@Req() req: Request, @Param('id') id: string) {
    const result = await this.recipeService.remove(req, +id);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }
}
