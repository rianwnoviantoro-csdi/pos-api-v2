import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class PermissiosDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: 'number', title: 'id', required: true })
  id: number;
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', title: 'name', required: true })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', title: 'code', required: true })
  code?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ApiProperty({
    type: [PermissiosDto],
    title: 'permissions',
    required: false,
    description: 'Array of permission items',
  })
  permissions?: PermissiosDto[];
}
