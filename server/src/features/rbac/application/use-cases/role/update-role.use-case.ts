import { RoleBusinessException } from '../../../domain/exceptions/role-business.exception';
import { RoleRepository } from '../../../domain/repositories/role.repository';
import { HTTP_STATUS } from '@/cored/domain/constants';
import { UpdateRoleDto } from '../../dto/role/update-role.dto';

export class UpdateRoleUseCase<Context = unknown> {
  constructor(private readonly role_repository: RoleRepository<Context>) { }

  async execute(
    id: number,
    dto: UpdateRoleDto,
    context: Context,
    updated_by?: string | null,
  ): Promise<void> {
    const role = await this.role_repository.findById(id, context);

    if (!role) {
      throw new RoleBusinessException(
        `Role with ID ${id} not found.`,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    role.update({
      name: dto.name,
      description: dto.description ?? null,
      updated_by: updated_by ?? null,
    });

    await this.role_repository.update(id, role, context);
  }
}
