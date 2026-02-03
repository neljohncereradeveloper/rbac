import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { RBAC_DATABASE_MODELS } from '@/features/rbac/domain/constants';
import { RolePermissionEntity } from './role-permission.entity';
import { UserRoleEntity } from './user-role.entity';

@Entity(RBAC_DATABASE_MODELS.ROLES)
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    comment: 'Unique name of the role',
  })
  @Index()
  name: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Description of the role',
  })
  description: string | null;

  // Audit fields (in standard order)
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'User who deleted the role',
  })
  deleted_by: string | null;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deleted_at: Date | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'User who created the role',
  })
  created_by: string | null;

  @CreateDateColumn()
  created_at: Date;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'User who last updated the role',
  })
  updated_by: string | null;

  @UpdateDateColumn()
  updated_at: Date;

  /**
   * RELATIONS
   */
  @OneToMany(
    () => RolePermissionEntity,
    (rolePermission) => rolePermission.role,
  )
  role_permissions?: RolePermissionEntity[];

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.role)
  user_roles?: UserRoleEntity[];
}
