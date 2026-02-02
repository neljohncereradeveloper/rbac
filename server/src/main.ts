import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winston_config } from '@/core/infrastructure/logger';
import { ConfigService } from '@nestjs/config';
import {
  DomainExceptionFilter,
  JwtExceptionFilter,
} from '@/core/infrastructure/filters';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    snapshot: true,
    logger: WinstonModule.createLogger(winston_config),
  });

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalFilters(new DomainExceptionFilter(), new JwtExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT', 3000);
  const CORS_ORIGINS = configService.get<string>('CORS_ORIGINS');
  const SERVER = configService.get<string>('SERVER');
  const originArray = CORS_ORIGINS
    ? CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : [];

  app.enableCors({
    origin: originArray,
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.setGlobalPrefix('api');

  await app.listen(PORT, async () => {
    logger.log(`Application is running on: ${await app.getUrl()} : ${SERVER}`);
    logger.log(
      `Swagger documentation available at: ${await app.getUrl()}/api/docs`,
    );
  });
}
bootstrap();
