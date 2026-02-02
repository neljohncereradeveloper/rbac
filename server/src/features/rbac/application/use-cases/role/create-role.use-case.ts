import { Role } from '../../../domain/models/role.model';
import { RoleRepository } from '../../../domain/repositories/role.repository';
import { CreateRoleDto } from '../../dto/role/create-role.dto';

export class CreateRoleUseCase<Context = unknown> {
  constructor(private readonly role_repository: RoleRepository<Context>) { }

  async execute(
    dto: CreateRoleDto,
    context: Context,
    created_by?: string | null,
  ): Promise<Role> {
    const role = Role.create({
      name: dto.name,
      description: dto.description ?? null,
      created_by: created_by ?? null,
    });

    return await this.role_repository.create(
      role,
      context,
      dto.permission_ids,
    );
  }
}
