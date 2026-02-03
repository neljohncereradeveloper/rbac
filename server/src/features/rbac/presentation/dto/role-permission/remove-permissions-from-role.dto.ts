import { IsArray, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class RemovePermissionsFromRoleDto {
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
}
