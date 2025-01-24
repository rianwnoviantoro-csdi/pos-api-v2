import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class BaseFilterDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: 'string',
    title: 'sort',
    required: false,
    default: 'createdAt',
  })
  sort: string = 'createdAt';

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: 'string',
    title: 'order',
    required: false,
    default: 'ASC',
  })
  order: string = 'ASC';

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: 'string',
    title: 'page',
    required: false,
    default: '1',
  })
  page: string = '1';

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: 'string',
    title: 'limit',
    required: false,
    default: '10',
  })
  limit: string = '10';

  @IsOptional()
  @IsString()
  @ApiProperty({ type: 'string', title: 'search', required: false })
  search?: string;
}
