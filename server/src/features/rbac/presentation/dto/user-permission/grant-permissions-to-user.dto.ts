import { IsArray, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GrantPermissionsToUserDto {
  @ApiProperty({
    description: 'Array of permission IDs to grant to the user',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((v) => Number(v)).filter((v) => !isNaN(v));
    }
    return [Number(value)].filter((v) => !isNaN(v));
  })
  permission_ids: number[];

  @ApiPropertyOptional({
    description: 'Whether to replace existing permission grants',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  replace?: boolean;
}
