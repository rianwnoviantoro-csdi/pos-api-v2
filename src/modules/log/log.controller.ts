import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { LogService } from './log.service';
import { Permissions } from 'src/commons/decorators/role.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/commons/guards/role.guard';

@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('read:log')
  @ApiBearerAuth()
  async findAll() {
    const result = await this.logService.findAll();

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('read:log')
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    const result = await this.logService.findOne(+id);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }
}
