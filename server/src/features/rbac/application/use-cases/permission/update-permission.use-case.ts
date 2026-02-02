import { PermissionBusinessException } from '../../../domain/exceptions/permission-business.exception';
import { PermissionRepository } from '../../../domain/repositories/permission.repository';
import { HTTP_STATUS } from '@/cored/domain/constants';
import { UpdatePermissionDto } from '../../dto/permission/update-permission.dto';

export class UpdatePermissionUseCase<Context = unknown> {
  constructor(
    private readonly permission_repository: PermissionRepository<Context>,
  ) { }

  async execute(
    id: number,
    dto: UpdatePermissionDto,
    context: Context,
    updated_by?: string | null,
  ): Promise<void> {
    const permission = await this.permission_repository.findById(id, context);

    if (!permission) {
      throw new PermissionBusinessException(
        `Permission with ID ${id} not found.`,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    permission.update({
      name: dto.name,
      resource: dto.resource,
      action: dto.action,
      description: dto.description ?? null,
      updated_by: updated_by ?? null,
    });

    await this.permission_repository.update(id, permission, context);
  }
}
