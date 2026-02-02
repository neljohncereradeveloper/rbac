import { UserPermissionRepository } from '../../../domain/repositories/user-permission.repository';
import { DenyPermissionsToUserDto } from '../../dto/user-permission/deny-permissions-to-user.dto';

export class DenyPermissionsToUserUseCase<Context = unknown> {
  constructor(
    private readonly user_permission_repository: UserPermissionRepository<Context>,
  ) { }

  async execute(
    dto: DenyPermissionsToUserDto,
    context: Context,
  ): Promise<void> {
    await this.user_permission_repository.denyToUser(
      dto.user_id,
      dto.permission_ids,
      context,
    );
  }
}
