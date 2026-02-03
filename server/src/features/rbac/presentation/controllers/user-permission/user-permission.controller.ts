import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Version,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { RequestInfo, createRequestInfo } from '@/core/utils/request-info.util';
import {
  GrantPermissionsToUserUseCase,
  DenyPermissionsToUserUseCase,
  RemovePermissionsFromUserUseCase,
} from '../../../application/use-cases';
import {
  GrantPermissionsToUserDto as GrantPermissionsToUserPresentationDto,
  DenyPermissionsToUserDto as DenyPermissionsToUserPresentationDto,
  RemovePermissionsFromUserDto as RemovePermissionsFromUserPresentationDto,
} from '../../dto';
import {
  GrantPermissionsToUserCommand,
  DenyPermissionsToUserCommand,
  RemovePermissionsFromUserCommand,
} from '../../../application/commands';

@Controller('users/:userId/permissions')
export class UserPermissionController {
  constructor(
    private readonly grantPermissionsToUserUseCase: GrantPermissionsToUserUseCase,
    private readonly denyPermissionsToUserUseCase: DenyPermissionsToUserUseCase,
    private readonly removePermissionsFromUserUseCase: RemovePermissionsFromUserUseCase,
  ) { }

  @Post('grant')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  async grantPermissions(
    @Param('userId') userId: number,
    @Body() presentationDto: GrantPermissionsToUserPresentationDto,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: GrantPermissionsToUserCommand = {
      user_id: userId,
      permission_ids: presentationDto.permission_ids,
      replace: presentationDto.replace,
    };
    await this.grantPermissionsToUserUseCase.execute(command, requestInfo);
    return { success: true };
  }

  @Post('deny')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  async denyPermissions(
    @Param('userId') userId: number,
    @Body() presentationDto: DenyPermissionsToUserPresentationDto,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: DenyPermissionsToUserCommand = {
      user_id: userId,
      permission_ids: presentationDto.permission_ids,
      replace: presentationDto.replace,
    };
    await this.denyPermissionsToUserUseCase.execute(command, requestInfo);
    return { success: true };
  }

  @Delete()
  @Version('1')
  @HttpCode(HttpStatus.OK)
  async removeOverrides(
    @Param('userId') userId: number,
    @Body() presentationDto: RemovePermissionsFromUserPresentationDto,
    @Req() request: Request,
  ): Promise<{ success: boolean }> {
    const requestInfo = createRequestInfo(request);
    // Map presentation DTO to application command
    const command: RemovePermissionsFromUserCommand = {
      user_id: userId,
      permission_ids: presentationDto.permission_ids,
    };
    await this.removePermissionsFromUserUseCase.execute(command, requestInfo);
    return { success: true };
  }
}
