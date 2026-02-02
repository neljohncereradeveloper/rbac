import { Permission } from '../../../domain/models/permission.model';
import { PermissionRepository } from '../../../domain/repositories/permission.repository';
import { CreatePermissionDto } from '../../dto/permission/create-permission.dto';

export class CreatePermissionUseCase<Context = unknown> {
  constructor(
    private readonly permission_repository: PermissionRepository<Context>,
  ) { }

  async execute(
    dto: CreatePermissionDto,
    context: Context,
    created_by?: string | null,
  ): Promise<Permission> {
    const permission = Permission.create({
      name: dto.name,
      resource: dto.resource,
      action: dto.action,
      description: dto.description ?? null,
      created_by: created_by ?? null,
    });

    return await this.permission_repository.create(permission, context);
  }
}
