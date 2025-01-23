import { Controller, Get, UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/commons/guards/role.guard';
import { Permissions } from 'src/commons/decorators/role.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('read:menu')
  @ApiBearerAuth()
  async findAll() {
    const result = await this.menuService.findAll();

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }
}
