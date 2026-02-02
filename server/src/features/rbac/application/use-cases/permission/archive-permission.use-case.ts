import { PermissionBusinessException } from '../../../domain/exceptions/permission-business.exception';
import { PermissionRepository } from '../../../domain/repositories/permission.repository';
import { HTTP_STATUS } from '@/cored/domain/constants';

export class ArchivePermissionUseCase<Context = unknown> {
  constructor(
    private readonly permission_repository: PermissionRepository<Context>,
  ) { }

  async execute(
    id: number,
    context: Context,
    deleted_by: string,
  ): Promise<void> {
    const permission = await this.permission_repository.findById(id, context);

    if (!permission) {
      throw new PermissionBusinessException(
        `Permission with ID ${id} not found.`,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    permission.archive(deleted_by);
    await this.permission_repository.update(id, permission, context);
  }
}
