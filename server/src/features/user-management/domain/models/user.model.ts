import { HTTP_STATUS } from '@/cored/domain/constants';
import { getPHDateTime } from '@/core/utils/date.util';
import { UserBusinessException } from '../exceptions';

export class User {
  id?: number;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  date_of_birth: Date | null;
  is_active: boolean;
  deleted_by: string | null;
  deleted_at: Date | null;
  created_by: string | null;
  created_at: Date;
  updated_by: string | null;
  updated_at: Date;

  constructor(dto: {
    id?: number;
    username: string;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
    date_of_birth?: Date | null;
    is_active?: boolean;
    deleted_by?: string | null;
    deleted_at?: Date | null;
    created_by?: string | null;
    created_at?: Date;
    updated_by?: string | null;
    updated_at?: Date;
  }) {
    this.id = dto.id;
    this.username = dto.username;
    this.email = dto.email;
    this.first_name = dto.first_name ?? null;
    this.last_name = dto.last_name ?? null;
    this.phone = dto.phone ?? null;
    this.date_of_birth = dto.date_of_birth ?? null;
    this.is_active = dto.is_active ?? true;
    this.deleted_by = dto.deleted_by ?? null;
    this.deleted_at = dto.deleted_at ?? null;
    this.created_by = dto.created_by ?? null;
    this.created_at = dto.created_at ?? getPHDateTime();
    this.updated_by = dto.updated_by ?? null;
    this.updated_at = dto.updated_at ?? getPHDateTime();
  }

  /** Static factory: create and validate. */
  static create(params: {
    username: string;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
    date_of_birth?: Date | null;
    is_active?: boolean;
    created_by?: string | null;
  }): User {
    const user = new User({
      username: params.username,
      email: params.email,
      first_name: params.first_name ?? null,
      last_name: params.last_name ?? null,
      phone: params.phone ?? null,
      date_of_birth: params.date_of_birth ?? null,
      is_active: params.is_active ?? true,
      created_by: params.created_by ?? null,
    });
    user.validate();
    return user;
  }

  /** Update details; validate new state before applying. */
  update(dto: {
    username?: string;
    email?: string;
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
    date_of_birth?: Date | null;
    is_active?: boolean;
    updated_by?: string | null;
  }): void {
    if (this.deleted_at) {
      throw new UserBusinessException(
        'User is archived and cannot be updated',
        HTTP_STATUS.CONFLICT,
      );
    }
    const temp_user = new User({
      id: this.id,
      username: dto.username ?? this.username,
      email: dto.email ?? this.email,
      first_name: dto.first_name ?? this.first_name,
      last_name: dto.last_name ?? this.last_name,
      phone: dto.phone ?? this.phone,
      date_of_birth: dto.date_of_birth ?? this.date_of_birth,
      is_active: dto.is_active ?? this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at,
    });
    temp_user.validate();
    this.username = dto.username ?? this.username;
    this.email = dto.email ?? this.email;
    this.first_name = dto.first_name ?? this.first_name;
    this.last_name = dto.last_name ?? this.last_name;
    this.phone = dto.phone ?? this.phone;
    this.date_of_birth = dto.date_of_birth ?? this.date_of_birth;
    this.is_active = dto.is_active ?? this.is_active;
    this.updated_by = dto.updated_by ?? null;
  }

  /** Soft-delete. */
  archive(deleted_by: string): void {
    if (this.deleted_at) {
      throw new UserBusinessException(
        'User is already archived.',
        HTTP_STATUS.CONFLICT,
      );
    }
    this.deleted_at = getPHDateTime();
    this.deleted_by = deleted_by;
  }

  /** Restore from archive. */
  restore(): void {
    if (!this.deleted_at) {
      throw new UserBusinessException(
        `User with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }
    this.deleted_at = null;
    this.deleted_by = null;
  }

  /** Enforce business rules. */
  validate(): void {
    if (!this.username || this.username.trim().length === 0) {
      throw new UserBusinessException(
        'Username is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (this.username.length > 100) {
      throw new UserBusinessException(
        'Username must not exceed 100 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (this.username.trim().length < 3) {
      throw new UserBusinessException(
        'Username must be at least 3 characters long.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (!this.email || this.email.trim().length === 0) {
      throw new UserBusinessException(
        'Email is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (this.email.length > 255) {
      throw new UserBusinessException(
        'Email must not exceed 255 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_regex.test(this.email)) {
      throw new UserBusinessException(
        'Email must be a valid email address.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (this.first_name !== null && this.first_name !== undefined) {
      if (this.first_name.length > 100) {
        throw new UserBusinessException(
          'First name must not exceed 100 characters.',
          HTTP_STATUS.BAD_REQUEST,
        );
      }
    }
    if (this.last_name !== null && this.last_name !== undefined) {
      if (this.last_name.length > 100) {
        throw new UserBusinessException(
          'Last name must not exceed 100 characters.',
          HTTP_STATUS.BAD_REQUEST,
        );
      }
    }
    if (this.phone !== null && this.phone !== undefined) {
      if (this.phone.length > 20) {
        throw new UserBusinessException(
          'Phone number must not exceed 20 characters.',
          HTTP_STATUS.BAD_REQUEST,
        );
      }
      const phone_regex = /^[\d\s\-\+\(\)]+$/;
      if (!phone_regex.test(this.phone)) {
        throw new UserBusinessException(
          'Phone number contains invalid characters.',
          HTTP_STATUS.BAD_REQUEST,
        );
      }
    }
    if (this.date_of_birth !== null && this.date_of_birth !== undefined) {
      const today = new Date();
      const birth_date = new Date(this.date_of_birth);
      if (birth_date > today) {
        throw new UserBusinessException(
          'Date of birth cannot be in the future.',
          HTTP_STATUS.BAD_REQUEST,
        );
      }
      const age = today.getFullYear() - birth_date.getFullYear();
      if (age > 150) {
        throw new UserBusinessException(
          'Date of birth is invalid (age exceeds 150 years).',
          HTTP_STATUS.BAD_REQUEST,
        );
      }
    }
  }
}
