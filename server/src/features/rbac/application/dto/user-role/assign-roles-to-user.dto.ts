export class AssignRolesToUserDto {
  user_id: number;
  role_ids: number[];
  replace?: boolean;
}
