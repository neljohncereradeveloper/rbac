import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckResponseDto {
  @ApiProperty({
    description: 'Overall health status',
    example: 'ok',
    enum: ['ok', 'error'],
  })
  status: 'ok' | 'error';

  @ApiProperty({
    description: 'Health check information',
    example: {
      database: {
        status: 'up',
      },
      swagger: {
        status: 'up',
      },
    },
  })
  info: {
    database: {
      status: 'up' | 'down';
    };
    swagger?: {
      status: 'up' | 'down';
    };
  };

  @ApiProperty({
    description: 'Health check errors (if any)',
    example: {},
    required: false,
  })
  error?: Record<string, unknown>;

  @ApiProperty({
    description: 'Health check details',
    example: {
      database: {
        status: 'up',
        message: 'OK',
      },
    },
    required: false,
  })
  details?: Record<string, unknown>;
}
