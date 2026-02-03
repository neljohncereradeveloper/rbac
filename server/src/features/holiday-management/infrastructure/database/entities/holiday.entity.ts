import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { HOLIDAY_MANAGEMENT_DATABASE_MODELS } from '@/features/holiday-management/domain/constants';

@Entity(HOLIDAY_MANAGEMENT_DATABASE_MODELS.HOLIDAYS)
export class HolidayEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Name of the holiday',
  })
  @Index()
  name: string;

  @Column({
    type: 'date',
    comment: 'Date of the holiday',
  })
  @Index()
  date: Date;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Type of holiday (e.g., National, Regional, Special)',
  })
  @Index()
  type: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Description of the holiday',
  })
  description: string | null;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether the holiday recurs annually',
  })
  is_recurring: boolean;

  // Audit fields (in standard order)
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'User who deleted the holiday',
  })
  deleted_by: string | null;

  @DeleteDateColumn({ nullable: true })
  @Index()
  deleted_at: Date | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'User who created the holiday',
  })
  created_by: string | null;

  @CreateDateColumn()
  created_at: Date;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'User who last updated the holiday',
  })
  updated_by: string | null;

  @UpdateDateColumn()
  updated_at: Date;
}
