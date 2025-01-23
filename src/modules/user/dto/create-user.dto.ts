import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', title: 'name', required: true })
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ type: 'string', title: 'email', required: true })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', title: 'password', required: true })
  password: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: 'number', title: 'role', required: true })
  role: number;
}
