import { Injectable, Inject } from '@nestjs/common';
import { HealthCheckResponse } from '../../../domain/models/health-check.model';
import { DatabaseHealthService } from '../../../infrastructure/services/database-health.service';
import { HEALTH_CHECK_TOKENS } from '../../../domain/constants';

@Injectable()
export class CheckHealthUseCase {
  constructor(
    @Inject(HEALTH_CHECK_TOKENS.DATABASE_HEALTH)
    private readonly databaseHealthService: DatabaseHealthService,
  ) { }

  async execute(version: string): Promise<HealthCheckResponse> {
    const database_health = await this.databaseHealthService.checkHealth();

    return HealthCheckResponse.create({
      database_status: database_health.status,
      database_response_time_ms: database_health.response_time_ms,
      version,
    });
  }
}
