import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  OptionalStringValidation,
  RequiredNumberValidation,
} from '../decorators';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search term to filter results',
    example: '',
    minLength: 0,
    maxLength: 255,
    pattern: '^[a-zA-Z0-9\\s\\-\\.\\@]+$',
  })
  @OptionalStringValidation({
    field_name: 'Search term',
    min_length: 0,
    max_length: 255,
    pattern: /^[a-zA-Z0-9\s\-\.\@]+$/,
    pattern_message:
      'Search term can only contain letters, numbers, spaces, hyphens, dots, and @ symbols',
    sanitize: true,
  })
  term?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: '1',
    default: '1',
  })
  @RequiredNumberValidation({
    field_name: 'Page Number',
    min: 0,
    max: 150,
    allow_zero: true,
    allow_negative: false,
    transform: true,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: '10',
    default: '10',
    maximum: 100,
  })
  @RequiredNumberValidation({
    field_name: 'Page Limit',
    min: 0,
    max: 150,
    allow_zero: true,
    allow_negative: false,
    transform: true,
  })
  limit: number;

  @ApiPropertyOptional({
    description: 'Filter by archived status',
    example: 'false',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return 'true';
    if (value === 'false' || value === false) return 'false';
    return 'false';
  })
  is_archived?: string;
}
