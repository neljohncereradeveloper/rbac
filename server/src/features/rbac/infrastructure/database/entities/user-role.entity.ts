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
import { UserEntity } from '@/features/user-management/infrastructure/database/entities/user.entity';

@Entity(RBAC_DATABASE_MODELS.USER_ROLES)
@Index(['user_id', 'role_id'], { unique: true })
export class UserRoleEntity {
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
    comment: 'ID of the role',
  })
  @Index()
  role_id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'User who created the user-role link',
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

  @ManyToOne(() => RoleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role?: RoleEntity;
}
