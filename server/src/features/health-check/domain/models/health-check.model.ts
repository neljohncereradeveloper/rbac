export class HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  database: {
    status: 'connected' | 'disconnected';
    response_time_ms?: number;
  };
  version: string;

  constructor(dto: {
    status: 'ok' | 'error';
    timestamp: string;
    uptime: number;
    database: {
      status: 'connected' | 'disconnected';
      response_time_ms?: number;
    };
    version: string;
  }) {
    this.status = dto.status;
    this.timestamp = dto.timestamp;
    this.uptime = dto.uptime;
    this.database = dto.database;
    this.version = dto.version;
  }

  static create(params: {
    database_status: 'connected' | 'disconnected';
    database_response_time_ms?: number;
    version: string;
  }): HealthCheckResponse {
    return new HealthCheckResponse({
      status: params.database_status === 'connected' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: params.database_status,
        response_time_ms: params.database_response_time_ms,
      },
      version: params.version,
    });
  }
}
