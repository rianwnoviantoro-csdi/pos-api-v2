import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ type: 'string', title: 'email', required: true })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', title: 'password', required: true })
  password: string;
}
