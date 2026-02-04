import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Version,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { RateLimit, RATE_LIMIT_STRICT } from '@/core/infrastructure/decorators';
import { Public } from '../../infrastructure/decorators/public.decorator';
import { LoginDto } from '../dto/login/login.dto';
import { LoginUseCase } from '../../application/use-cases/login/login.use-case';
import { LoginCommand } from '../../application/commands/login/login.command';

/**
 * Authentication Controller
 * Handles authentication endpoints (login, etc.)
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) { }

  @Version('1')
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  @RateLimit({
    ...RATE_LIMIT_STRICT,
    message: 'Too many login attempts. Please try again later.',
  })
  @ApiOperation({ summary: 'Authenticate user and get JWT token' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const command: LoginCommand = {
      username_or_email: loginDto.username_or_email,
      password: loginDto.password,
    };

    return this.loginUseCase.execute(command);
  }
}
