import { UserRoleRepository } from '../../../domain/repositories/user-role.repository';
import { AssignRolesToUserDto } from '../../dto/user-role/assign-roles-to-user.dto';

export class AssignRolesToUserUseCase<Context = unknown> {
  constructor(
    private readonly user_role_repository: UserRoleRepository<Context>,
  ) { }

  async execute(
    dto: AssignRolesToUserDto,
    context: Context,
  ): Promise<void> {
    await this.user_role_repository.assignToUser(
      dto.user_id,
      dto.role_ids,
      context,
      dto.replace ?? false,
    );
  }
}
