import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateMemberDto } from './create-member.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', title: 'name', required: false })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', title: 'phone', required: false })
  phone?: string;
}
