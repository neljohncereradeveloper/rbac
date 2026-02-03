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
import { USER_MANAGEMENT_DATABASE_MODELS } from '@/features/user-management/domain/constants';
import { UserRoleEntity } from '@/features/rbac/infrastructure/database/entities/user-role.entity';
import { UserPermissionEntity } from '@/features/rbac/infrastructure/database/entities/user-permission.entity';

@Entity(USER_MANAGEMENT_DATABASE_MODELS.USERS)
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment: 'Unique username for the user',
  })
  @Index()
  username: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    comment: 'Unique email address for the user',
  })
  @Index()
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Hashed password for the user',
  })
  password: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'First name of the user',
  })
  first_name: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Middle name of the user',
  })
  middle_name: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Last name of the user',
  })
  last_name: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: 'Phone number of the user',
  })
  phone: string | null;

  @Column({
    type: 'date',
    nullable: true,
    comment: 'Date of birth of the user',
  })
  date_of_birth: Date | null;

  @Column({
    type: 'boolean',
    default: true,
    comment: 'Whether the user account is active',
  })
  is_active: boolean;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether the user email is verified',
  })
  is_email_verified: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Timestamp when the email was verified',
  })
  is_email_verified_at: Date | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'User who changed the password',
  })
  change_password_by: string | null;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Timestamp when the password was changed',
  })
  change_password_at: Date | null;

  // Audit fields (in standard order)
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'User who deleted the user',
  })
  deleted_by: string | null;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deleted_at: Date | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'User who created the user',
  })
  created_by: string | null;

  @CreateDateColumn()
  created_at: Date;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'User who last updated the user',
  })
  updated_by: string | null;

  @UpdateDateColumn()
  updated_at: Date;

  /**
   * RELATIONS
   */
  @OneToMany(() => UserRoleEntity, (userRole) => userRole.user)
  user_roles?: UserRoleEntity[];

  @OneToMany(
    () => UserPermissionEntity,
    (userPermission) => userPermission.user,
  )
  user_permissions?: UserPermissionEntity[];
}
