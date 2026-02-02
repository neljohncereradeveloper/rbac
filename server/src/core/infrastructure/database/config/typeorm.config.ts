import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { allEntities } from '../entities/all-entities';

export const getTypeormConfig = (
  config_service: ConfigService,
): TypeOrmModuleOptions => ({
  type: config_service.get<'postgres'>('DB_TYPE', 'postgres'),
  url: config_service.get<string>('DB_URL'),
  entities: allEntities,
  synchronize: false, // Disable in production
  logging: config_service.get<boolean>('DB_LOGGING', false),
  extra: {
    timezone: '+08:00', // Force Manila timezone
  },
});
