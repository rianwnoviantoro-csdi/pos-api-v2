import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', title: 'name', required: false })
  name: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({ type: 'string', title: 'email', required: false })
  email: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', title: 'password', required: false })
  password: string;
}
