export class DenyPermissionsToUserDto {
  user_id: number;
  permission_ids: number[];
  replace?: boolean;
}
