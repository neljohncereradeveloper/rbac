export class GrantPermissionsToUserDto {
  user_id: number;
  permission_ids: number[];
  replace?: boolean;
}
