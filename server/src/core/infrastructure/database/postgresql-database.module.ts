import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getTypeormConfig } from './config/typeorm.config';
import { allEntities } from './entities/all-entities';

@Module({
  imports: [
    ConfigModule.forRoot(), // Load .env configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config_service: ConfigService) =>
        getTypeormConfig(config_service),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature(allEntities),
  ],
  exports: [TypeOrmModule], // Export TypeOrmModule for use in other modules
})
export class PostgresqlDatabaseModule {}
