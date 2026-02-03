import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Version,
} from '@nestjs/common';
import { Public } from '../../infrastructure/decorators/public.decorator';
import { LoginDto } from '../dto/login/login.dto';
import { LoginUseCase } from '../../application/use-cases/login/login.use-case';
import { LoginCommand } from '../../application/commands/login/login.command';

/**
 * Authentication Controller
 * Handles authentication endpoints (login, etc.)
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  /**
   * Login endpoint
   * Authenticates user and returns JWT token
   */
  @Public()
  @Post('login')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const command: LoginCommand = {
      username_or_email: loginDto.username_or_email,
      password: loginDto.password,
    };

    return this.loginUseCase.execute(command);
  }
}
