import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateApiKeyDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: 'string', title: 'name', required: true })
  name: string;
}
