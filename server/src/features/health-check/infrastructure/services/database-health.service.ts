import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface DatabaseHealthResult {
  status: 'connected' | 'disconnected';
  response_time_ms?: number;
}

@Injectable()
export class DatabaseHealthService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) { }

  async checkHealth(): Promise<DatabaseHealthResult> {
    const start_time = Date.now();

    try {
      // Simple query to check database connection
      await this.dataSource.query('SELECT 1');
      const response_time_ms = Date.now() - start_time;

      return {
        status: 'connected',
        response_time_ms,
      };
    } catch (error) {
      return {
        status: 'disconnected',
      };
    }
  }
}
