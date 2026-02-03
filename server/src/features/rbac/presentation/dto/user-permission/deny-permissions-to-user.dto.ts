import { IsArray, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class DenyPermissionsToUserDto {
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

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  replace?: boolean;
}
