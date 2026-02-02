import { Role } from '../../../domain/models/role.model';
import { RoleBusinessException } from '../../../domain/exceptions/role-business.exception';
import { RoleRepository } from '../../../domain/repositories/role.repository';
import { HTTP_STATUS } from '@/cored/domain/constants';

export class GetRoleByIdUseCase<Context = unknown> {
  constructor(private readonly role_repository: RoleRepository<Context>) { }

  async execute(id: number, context: Context): Promise<Role> {
    const role = await this.role_repository.findById(id, context);

    if (!role) {
      throw new RoleBusinessException(
        `Role with ID ${id} not found.`,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return role;
  }
}
