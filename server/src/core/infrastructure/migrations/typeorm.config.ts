import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';


config();
const config_service = new ConfigService();
export default new DataSource({
  type: 'postgres',
  url: config_service.get<string>('DB_URL'),
  // host: config_service.get('DB_HOST'),
  // port: Number(config_service.get('DB_PORT')),
  // username: config_service.get('DB_USERNAME'),
  // password: config_service.get('DB_PASSWORD'),
  // database: config_service.get('DB_DATABASE'),
  entities: [],
  migrations: [
    'dist/src/core/infrastructure/database/migrations/files/*.{ts,js}',
  ],
  logging: config_service.get('NODE_ENV') === 'development',
  synchronize: false,
  extra: {
    timezone: '+08:00', // Force Manila timezone
  },
});
