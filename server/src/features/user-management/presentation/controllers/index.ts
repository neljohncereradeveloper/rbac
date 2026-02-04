import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Version,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import { createRequestInfo } from '@/core/utils/request-info.util';
import {
  RequirePermissions,
  RequireRoles,
} from '@/features/auth/infrastructure/decorators';
import { PERMISSIONS, ROLES } from '@/core/domain/constants';
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
} from '../../application/use-cases/user';
import {
  CreateUserDto as CreateUserPresentationDto,
  UpdateUserDto as UpdateUserPresentationDto,
  ChangePasswordDto as ChangePasswordPresentationDto,
} from '../dto/user';
import {
  CreateUserCommand,
  UpdateUserCommand,
  ChangePasswordCommand,
  VerifyEmailCommand,
} from '../../application/commands/user';
import { User } from '../../domain/models';
import { PaginatedResult } from '@/core/utils/pagination.util';
import { PaginationQueryDto } from '@/core/infrastructure/dto';
import {
  RateLimit,
  RATE_LIMIT_MODERATE,
} from '@/core/infrastructure/decorators';

@ApiTags('User')
@Controller('users')
@RateLimit({
  ...RATE_LIMIT_MODERATE,
  message: 'Too many requests. Please try again later.',
})
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

  @Version('1')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.USERS.CREATE)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserPresentationDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
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

  @Version('1')
  @Put(':id')
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.USERS.UPDATE)
  @ApiOperation({ summary: 'Update user information' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiBody({ type: UpdateUserPresentationDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseIntPipe) id: number,
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

  @Version('1')
  @Post(':id/change-password')
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.USERS.CHANGE_PASSWORD)
  @ApiOperation({ summary: 'Change user password' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiBody({ type: ChangePasswordPresentationDto })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
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

  @Version('1')
  @Post(':id/verify-email')
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.USERS.VERIFY_EMAIL)
  @ApiOperation({ summary: 'Verify user email' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async verifyEmail(
    @Param('id', ParseIntPipe) id: number,
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

  @Version('1')
  @Delete(':id/archive')
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.USERS.ARCHIVE)
  @ApiOperation({ summary: 'Archive a user' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiResponse({ status: 200, description: 'User archived successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    await this.archiveUserUseCase.execute(id, requestInfo);
    return { success: true };
  }

  @Version('1')
  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.USERS.RESTORE)
  @ApiOperation({ summary: 'Restore a user' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiResponse({ status: 200, description: 'User restored successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    await this.restoreUserUseCase.execute(id, requestInfo);
    return { success: true };
  }

  @Version('1')
  @Get(':id')
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.USERS.READ)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: 1 })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.getUserByIdUseCase.execute(id);
  }

  @Version('1')
  @Get()
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.USERS.PAGINATED_LIST)
  @ApiOperation({ summary: 'Get paginated list of users' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
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

  @Version('1')
  @Get('combobox/list')
  @RequireRoles(ROLES.ADMIN)
  @RequirePermissions(PERMISSIONS.USERS.COMBOBOX)
  @ApiOperation({ summary: 'Get users combobox list' })
  @ApiResponse({
    status: 200,
    description: 'Users combobox retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT-auth')
  async getCombobox(): Promise<{ value: string; label: string }[]> {
    return this.comboboxUserUseCase.execute();
  }
}
