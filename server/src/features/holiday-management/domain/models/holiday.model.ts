import { HTTP_STATUS } from '@/core/domain/constants';
import { getPHDateTime } from '@/core/utils/date.util';
import { HolidayBusinessException } from '../exceptions';

export class Holiday {
  id?: number;
  name: string;
  date: Date;
  type: string;
  description: string | null;
  is_recurring: boolean;
  deleted_by: string | null;
  deleted_at: Date | null;
  created_by: string | null;
  created_at: Date;
  updated_by: string | null;
  updated_at: Date;

  constructor(dto: {
    id?: number;
    name: string;
    date: Date;
    type: string;
    description?: string | null;
    is_recurring?: boolean;
    deleted_by?: string | null;
    deleted_at?: Date | null;
    created_by?: string | null;
    created_at?: Date;
    updated_by?: string | null;
    updated_at?: Date;
  }) {
    this.id = dto.id;
    this.name = dto.name;
    this.date = dto.date;
    this.type = dto.type;
    this.description = dto.description ?? null;
    this.is_recurring = dto.is_recurring ?? false;
    this.deleted_by = dto.deleted_by ?? null;
    this.deleted_at = dto.deleted_at ?? null;
    this.created_by = dto.created_by ?? null;
    this.created_at = dto.created_at ?? getPHDateTime();
    this.updated_by = dto.updated_by ?? null;
    this.updated_at = dto.updated_at ?? getPHDateTime();
  }

  /** Static factory: create and validate. */
  static create(params: {
    name: string;
    date: Date;
    type: string;
    description?: string | null;
    is_recurring?: boolean;
    created_by?: string | null;
  }): Holiday {
    const holiday = new Holiday({
      name: params.name,
      date: params.date,
      type: params.type,
      description: params.description ?? null,
      is_recurring: params.is_recurring ?? false,
      created_by: params.created_by ?? null,
    });
    holiday.validate();
    return holiday;
  }

  /** Update details; validate new state before applying. */
  update(dto: {
    name: string;
    date: Date;
    type: string;
    description?: string | null;
    is_recurring?: boolean;
    updated_by?: string | null;
  }): void {
    if (this.deleted_at) {
      throw new HolidayBusinessException(
        'Holiday is archived and cannot be updated',
        HTTP_STATUS.CONFLICT,
      );
    }
    const temp_holiday = new Holiday({
      id: this.id,
      name: dto.name,
      date: dto.date,
      type: dto.type,
      description: dto.description ?? this.description,
      is_recurring: dto.is_recurring ?? this.is_recurring,
      created_at: this.created_at,
      updated_at: this.updated_at,
    });
    temp_holiday.validate();
    this.name = dto.name;
    this.date = dto.date;
    this.type = dto.type;
    this.description = dto.description ?? this.description;
    this.is_recurring = dto.is_recurring ?? this.is_recurring;
    this.updated_by = dto.updated_by ?? null;
  }

  /** Soft-delete. */
  archive(deleted_by: string): void {
    if (this.deleted_at) {
      throw new HolidayBusinessException(
        'Holiday is already archived.',
        HTTP_STATUS.CONFLICT,
      );
    }
    this.deleted_at = getPHDateTime();
    this.deleted_by = deleted_by;
  }

  /** Restore from archive. */
  restore(): void {
    if (!this.deleted_at) {
      throw new HolidayBusinessException(
        `Holiday with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }
    this.deleted_at = null;
    this.deleted_by = null;
  }

  /** Enforce business rules. */
  validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new HolidayBusinessException(
        'Holiday name is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (this.name.length > 255) {
      throw new HolidayBusinessException(
        'Holiday name must not exceed 255 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (this.name.trim().length < 2) {
      throw new HolidayBusinessException(
        'Holiday name must be at least 2 characters long.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (!this.date) {
      throw new HolidayBusinessException(
        'Holiday date is required.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (!this.type || this.type.trim().length === 0) {
      throw new HolidayBusinessException(
        'Holiday type is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (this.type.length > 50) {
      throw new HolidayBusinessException(
        'Holiday type must not exceed 50 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (this.description !== null && this.description !== undefined) {
      if (this.description.length > 500) {
        throw new HolidayBusinessException(
          'Holiday description must not exceed 500 characters.',
          HTTP_STATUS.BAD_REQUEST,
        );
      }
    }
  }
}
