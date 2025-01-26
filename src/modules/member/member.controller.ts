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
} from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Permissions } from 'src/commons/decorators/role.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/commons/guards/role.guard';
import { Request } from 'express';
import { BaseFilterDto } from 'src/commons/dto/base-filter.dto';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('write:member')
  @ApiBearerAuth()
  async create(@Req() req: Request, @Body() createMemberDto: CreateMemberDto) {
    const result = await this.memberService.create(req, createMemberDto);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('read:member')
  @ApiBearerAuth()
  async findAll(@Req() req: Request, @Query() filter: BaseFilterDto) {
    const { data, meta } = await this.memberService.findAll(req, filter);

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
  @Permissions('read:member')
  @ApiBearerAuth()
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const result = await this.memberService.findOne(req, +id);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('write:member')
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    const result = await this.memberService.update(+id, req, updateMemberDto);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Permissions('delete:member')
  @ApiBearerAuth()
  async remove(@Req() req: Request, @Param('id') id: string) {
    const result = await this.memberService.remove(+id, req);

    return {
      message: 'Success.',
      error: null,
      statusCode: 200,
      data: result,
    };
  }
}
