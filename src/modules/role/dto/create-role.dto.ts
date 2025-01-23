import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class PermissiosDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: 'number', title: 'id', required: true })
  id: number;
}

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', title: 'name', required: true })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', title: 'code', required: true })
  code: string;

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
