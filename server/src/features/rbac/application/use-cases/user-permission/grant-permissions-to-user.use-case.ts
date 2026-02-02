import { UserPermissionRepository } from '../../../domain/repositories/user-permission.repository';
import { GrantPermissionsToUserDto } from '../../dto/user-permission/grant-permissions-to-user.dto';

export class GrantPermissionsToUserUseCase<Context = unknown> {
  constructor(
    private readonly user_permission_repository: UserPermissionRepository<Context>,
  ) { }

  async execute(
    dto: GrantPermissionsToUserDto,
    context: Context,
  ): Promise<void> {
    await this.user_permission_repository.grantToUser(
      dto.user_id,
      dto.permission_ids,
      context,
    );
  }
}
