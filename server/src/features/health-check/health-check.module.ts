import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';
import { HealthCheckController } from './presentation/controllers/health-check.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule,
    HttpModule,
    TerminusModule,
  ],
  controllers: [HealthCheckController],
})
export class HealthCheckModule { }
