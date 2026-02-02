import { DATABASE_CORE_MODELS } from '@/core/domain/constants';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity(DATABASE_CORE_MODELS.ACTIVITYLOGS)
export class ActivityLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  action: string; // e.g., 'CREATE_CLIENT', 'UPDATE_CLIENT'

  @Column({ length: 100 })
  entity: string; // e.g., 'Client'

  @Column({ type: 'json', nullable: true })
  details: Record<string, any>; // JSON type for cross-database compatibility

  @Column({ nullable: true })
  employee_id?: number; // foreign key to employees table (optional: only populated when activity is related to an employee)

  @CreateDateColumn()
  @Index()
  occurred_at: Date; // Automatically sets the current date and time

  @Column({ type: 'json', nullable: true })
  request_info: Record<string, any>; // JSON type for cross-database compatibilityty

  /**
   * RELATIONS
   */
  /**
   * Activity log may belong to an employee (optional)
   */
  // @ManyToOne(() => EmployeeEntity, { nullable: true })
  // @JoinColumn({ name: 'employee_id' })
  // employee?: EmployeeEntity;
}
