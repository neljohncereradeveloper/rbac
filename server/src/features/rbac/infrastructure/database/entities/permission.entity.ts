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
import { UserPermissionEntity } from './user-permission.entity';

@Entity(RBAC_DATABASE_MODELS.PERMISSIONS)
export class PermissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    comment: 'Unique name of the permission',
  })
  @Index()
  name: string;

  @Column({
    type: 'varchar',
    length: 100,
    comment: 'Resource that the permission applies to',
  })
  @Index()
  resource: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Action that the permission allows',
  })
  @Index()
  action: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Description of the permission',
  })
  description: string | null;

  // Audit fields (in standard order)
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'User who deleted the permission',
  })
  deleted_by: string | null;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deleted_at: Date | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'User who created the permission',
  })
  created_by: string | null;

  @CreateDateColumn()
  created_at: Date;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'User who last updated the permission',
  })
  updated_by: string | null;

  @UpdateDateColumn()
  updated_at: Date;

  /**
   * RELATIONS
   */
  @OneToMany(
    () => RolePermissionEntity,
    (rolePermission) => rolePermission.permission,
  )
  role_permissions?: RolePermissionEntity[];

  @OneToMany(
    () => UserPermissionEntity,
    (userPermission) => userPermission.permission,
  )
  user_permissions?: UserPermissionEntity[];
}
