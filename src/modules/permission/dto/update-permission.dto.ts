import { PartialType } from '@nestjs/mapped-types';
import { CreatePermissionDto } from './create-permission.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', title: 'name', required: false })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', title: 'code', required: false })
  code?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: 'number', title: 'role', required: false })
  role?: number;
}
