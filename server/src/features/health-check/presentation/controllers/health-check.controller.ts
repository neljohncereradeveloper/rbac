import {
  Controller,
  Get,
  Version,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '@/features/auth/infrastructure/decorators/public.decorator';
import { HealthCheckResponseDto } from '../dto/health-check-response.dto';
import { ConfigService } from '@nestjs/config';

/**
 * Health Check Controller
 * Provides health check endpoint for monitoring using NestJS Terminus
 */
@ApiTags('Health')
@Controller('health')
export class HealthCheckController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly http: HttpHealthIndicator,
    private readonly configService: ConfigService,
  ) { }

  @Version('1')
  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Check overall API health status' })
  @ApiResponse({
    status: 200,
    description: 'All health checks passed',
    type: HealthCheckResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Service unavailable - one or more health checks failed',
  })
  async check() {
    const port = this.configService.get<number>('PORT', 3220);
    const server = this.configService.get<string>('SERVER', 'localhost');
    const protocol = this.configService.get<string>('NODE_ENV') === 'production' ? 'https' : 'http';
    const swaggerUrl = `${protocol}://${server}:${port}/api/docs`;

    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 3000 }),
      () =>
        this.http.pingCheck('swagger', swaggerUrl, {
          timeout: 3000,
        }),
    ]);
  }

  @Version('1')
  @Get('database')
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Check database health status' })
  @ApiResponse({
    status: 200,
    description: 'Database health check passed',
    type: HealthCheckResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Database unavailable',
  })
  async checkDatabase() {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 3000 }),
    ]);
  }

  @Version('1')
  @Get('swagger')
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Check Swagger documentation endpoint health' })
  @ApiResponse({
    status: 200,
    description: 'Swagger endpoint health check passed',
    type: HealthCheckResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Swagger endpoint unavailable',
  })
  async checkSwagger() {
    const port = this.configService.get<number>('PORT', 3220);
    const server = this.configService.get<string>('SERVER', 'localhost');
    const protocol = this.configService.get<string>('NODE_ENV') === 'production' ? 'https' : 'http';
    const swaggerUrl = `${protocol}://${server}:${port}/api/docs`;

    return this.health.check([
      () =>
        this.http.pingCheck('swagger', swaggerUrl, {
          timeout: 3000,
        }),
    ]);
  }
}
