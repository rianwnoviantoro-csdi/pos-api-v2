import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BaseFilterDto } from 'src/commons/dto/base-filter.dto';

export class FilterLogDto extends BaseFilterDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', title: 'module', required: false })
  module?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', title: 'userId', required: false })
  userId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', title: 'roleId', required: false })
  roleId?: string;
}
