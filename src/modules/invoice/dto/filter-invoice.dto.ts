import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseFilterDto } from 'src/commons/dto/base-filter.dto';

export class FilterInvoiceDto extends BaseFilterDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', title: 'customer', required: false })
  customer?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', title: 'cashierId', required: false })
  cashierId?: string;
}
