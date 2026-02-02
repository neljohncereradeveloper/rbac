import { RoleBusinessException } from '../../../domain/exceptions/role-business.exception';
import { RolePermissionRepository } from '../../../domain/repositories/role-permission.repository';
import { RoleRepository } from '../../../domain/repositories/role.repository';
import { HTTP_STATUS } from '@/cored/domain/constants';
import { AssignPermissionsToRoleDto } from '../../dto/role-permission/assign-permissions-to-role.dto';

export class AssignPermissionsToRoleUseCase<Context = unknown> {
  constructor(
    private readonly role_repository: RoleRepository<Context>,
    private readonly role_permission_repository: RolePermissionRepository<Context>,
  ) { }

  async execute(
    dto: AssignPermissionsToRoleDto,
    context: Context,
  ): Promise<void> {
    const role = await this.role_repository.findById(dto.role_id, context);

    if (!role) {
      throw new RoleBusinessException(
        `Role with ID ${dto.role_id} not found.`,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    await this.role_permission_repository.assignToRole(
      dto.role_id,
      dto.permission_ids,
      context,
      dto.replace ?? false,
    );
  }
}
