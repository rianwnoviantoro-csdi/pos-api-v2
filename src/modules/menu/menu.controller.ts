import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/commons/guards/role.guard';
import { Permissions } from 'src/commons/decorators/role.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FilterMenuDto } from './dto/filter-menu.dto';
import { Request } from 'express';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('read:menu')
  @ApiBearerAuth()
  async findAll(@Req() req: Request, @Query() filter: FilterMenuDto) {
    const { data, meta } = await this.menuService.findAll(req, filter);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data,
      meta,
    };
  }
}
