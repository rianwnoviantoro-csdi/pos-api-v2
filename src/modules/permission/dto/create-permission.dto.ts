import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', title: 'name', required: true })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', title: 'code', required: true })
  code: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: 'number', title: 'role', required: false })
  role?: number;
}
