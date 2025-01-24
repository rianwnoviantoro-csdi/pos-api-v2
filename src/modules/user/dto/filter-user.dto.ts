import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BaseFilterDto } from 'src/commons/dto/base-filter.dto';

export class FilterInvoiceDto extends BaseFilterDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', title: 'roleId', required: false })
  roleId?: string;
}
