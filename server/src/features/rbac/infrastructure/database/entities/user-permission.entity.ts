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
import { PermissionEntity } from './permission.entity';
import { UserEntity } from '@/features/user-management/infrastructure/database/entities/user.entity';

@Entity(RBAC_DATABASE_MODELS.USER_PERMISSIONS)
@Index(['user_id', 'permission_id'], { unique: true })
export class UserPermissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    comment: 'ID of the user',
  })
  @Index()
  user_id: number;

  @Column({
    type: 'int',
    comment: 'ID of the permission',
  })
  @Index()
  permission_id: number;

  @Column({
    type: 'boolean',
    comment: 'Whether the permission is allowed (true) or denied (false)',
  })
  is_allowed: boolean;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'User who created the user-permission link',
  })
  created_by: string | null;

  @CreateDateColumn()
  created_at: Date;

  /**
   * RELATIONS
   */
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @ManyToOne(() => PermissionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission?: PermissionEntity;
}
