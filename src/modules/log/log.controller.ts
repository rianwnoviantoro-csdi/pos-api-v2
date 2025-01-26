import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { LogService } from './log.service';
import { Permissions } from 'src/commons/decorators/role.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/commons/guards/role.guard';
import { FilterLogDto } from './dto/filter-log.dto';
import { Request } from 'express';

@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('read:log')
  @ApiBearerAuth()
  async findAll(@Req() req: Request, @Query() filter: FilterLogDto) {
    const { data, meta } = await this.logService.findAll(req, filter);

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
  @Permissions('read:log')
  @ApiBearerAuth()
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const result = await this.logService.findOne(req, +id);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }
}
