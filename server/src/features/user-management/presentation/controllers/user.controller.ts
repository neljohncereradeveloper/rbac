import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Version,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { RequestInfo, createRequestInfo } from '@/core/utils/request-info.util';
import {
  CreateUserUseCase,
  UpdateUserUseCase,
  ChangePasswordUseCase,
  VerifyEmailUseCase,
  ArchiveUserUseCase,
  RestoreUserUseCase,
  GetUserByIdUseCase,
  GetPaginatedUserUseCase,
  ComboboxUserUseCase,
} from '../../application/use-cases';
import {
  CreateUserDto as CreateUserPresentationDto,
  UpdateUserDto as UpdateUserPresentationDto,
  ChangePasswordDto as ChangePasswordPresentationDto,
} from '../dto';
import {
  CreateUserCommand,
  UpdateUserCommand,
  ChangePasswordCommand,
  VerifyEmailCommand,
} from '../../application/commands';
import { User } from '../../domain/models';
import { PaginatedResult } from '@/core/utils/pagination.util';
import { PaginationQueryDto } from '@/core/infrastructure/dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly archiveUserUseCase: ArchiveUserUseCase,
    private readonly restoreUserUseCase: RestoreUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getPaginatedUserUseCase: GetPaginatedUserUseCase,
    private readonly comboboxUserUseCase: ComboboxUserUseCase,
  ) { }

  @Post()
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() presentationDto: CreateUserPresentationDto,
    @Req() request: Request,
  ): Promise<User> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: CreateUserCommand = {
      username: presentationDto.username,
      email: presentationDto.email,
      password: presentationDto.password,
      first_name: presentationDto.first_name ?? null,
      middle_name: presentationDto.middle_name ?? null,
      last_name: presentationDto.last_name ?? null,
      phone: presentationDto.phone ?? null,
      date_of_birth: presentationDto.date_of_birth ?? null,
      is_active: presentationDto.is_active ?? true,
      is_email_verified: presentationDto.is_email_verified ?? false,
    };
    return this.createUserUseCase.execute(command, requestInfo);
  }

  @Put(':id')
  @Version('1')
  async update(
    @Param('id') id: number,
    @Body() presentationDto: UpdateUserPresentationDto,
    @Req() request: Request,
  ): Promise<User | null> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    // Note: Username cannot be updated - it is immutable after creation
    const command: UpdateUserCommand = {
      email: presentationDto.email,
      first_name: presentationDto.first_name ?? null,
      middle_name: presentationDto.middle_name ?? null,
      last_name: presentationDto.last_name ?? null,
      phone: presentationDto.phone ?? null,
      date_of_birth: presentationDto.date_of_birth ?? null,
      is_active: presentationDto.is_active,
      is_email_verified: presentationDto.is_email_verified,
    };
    return this.updateUserUseCase.execute(id, command, requestInfo);
  }

  @Post(':id/change-password')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Param('id') id: number,
    @Body() presentationDto: ChangePasswordPresentationDto,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command (user_id comes from path parameter)
    const command: ChangePasswordCommand = {
      user_id: id,
      new_password: presentationDto.new_password,
    };
    await this.changePasswordUseCase.execute(command, requestInfo);
    return { success: true };
  }

  @Post(':id/verify-email')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Param('id') id: number,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    // Map to application command
    const command: VerifyEmailCommand = {
      user_id: id,
    };
    await this.verifyEmailUseCase.execute(command, requestInfo);
    return { success: true };
  }

  @Delete(':id')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  async archive(
    @Param('id') id: number,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    await this.archiveUserUseCase.execute(id, requestInfo);
    return { success: true };
  }

  @Post(':id/restore')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  async restore(
    @Param('id') id: number,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    await this.restoreUserUseCase.execute(id, requestInfo);
    return { success: true };
  }

  @Get(':id')
  @Version('1')
  async getById(@Param('id') id: number): Promise<User> {
    return this.getUserByIdUseCase.execute(id);
  }

  @Get()
  @Version('1')
  async getPaginated(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResult<User>> {
    return this.getPaginatedUserUseCase.execute(
      query.term ?? '',
      query.page,
      query.limit,
      query.is_archived === 'true',
    );
  }

  @Get('combobox/list')
  @Version('1')
  async getCombobox(): Promise<{ value: string; label: string }[]> {
    return this.comboboxUserUseCase.execute();
  }
}
