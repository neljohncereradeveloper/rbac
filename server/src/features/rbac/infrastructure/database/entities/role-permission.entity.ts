import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RBAC_DATABASE_MODELS } from '@/features/rbac/domain/constants';
import { RoleEntity } from './role.entity';
import { PermissionEntity } from './permission.entity';

@Entity(RBAC_DATABASE_MODELS.ROLE_PERMISSIONS)
@Index(['role_id', 'permission_id'], { unique: true })
export class RolePermissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    comment: 'ID of the role',
  })
  @Index()
  role_id: number;

  @Column({
    type: 'int',
    comment: 'ID of the permission',
  })
  @Index()
  permission_id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'User who created the role-permission link',
  })
  created_by: string | null;

  @CreateDateColumn()
  created_at: Date;

  /**
   * RELATIONS
   */
  @ManyToOne(() => RoleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role?: RoleEntity;

  @ManyToOne(() => PermissionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission?: PermissionEntity;
}
