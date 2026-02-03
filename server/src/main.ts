import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import { winston_config } from '@/core/infrastructure/logger';
import { ConfigService } from '@nestjs/config';
import {
  DomainExceptionFilter,
  JwtExceptionFilter,
} from '@/core/infrastructure/filters';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    snapshot: true,
    logger: WinstonModule.createLogger(winston_config),
  });

  // Trust proxy to get correct IP address from X-Forwarded-For header
  // This is important for rate limiting when behind a proxy/load balancer
  app.getHttpAdapter().getInstance().set('trust proxy', true);

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

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('RBAC API')
    .setDescription(
      'Role-Based Access Control (RBAC) API - A comprehensive system for managing user authentication, authorization, roles, and permissions. ' +
      'This API provides complete RBAC functionality including user management, role assignment, permission management, and fine-grained access control. ' +
      'All endpoints are protected by JWT authentication and enforce role-based and permission-based access policies.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    // Health Check
    .addTag('Health', 'Health check endpoints')

    // Authentication
    .addTag('Auth', 'Authentication endpoints')

    // User Management
    .addTag('User', 'User management endpoints')

    // RBAC - Roles
    .addTag('Role', 'Role management endpoints')

    // RBAC - Permissions
    .addTag('Permission', 'Permission management endpoints')

    // RBAC - Role-Permission Relationships
    .addTag('Role-Permission', 'Role-Permission relationship management endpoints')

    // RBAC - User-Role Relationships
    .addTag('User-Role', 'User-Role relationship management endpoints')

    // RBAC - User-Permission Relationships
    .addTag('User-Permission', 'User-Permission override management endpoints')

    // Holiday Management
    .addTag('Holiday', 'Holiday management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Add tag groups for better organization
  (document as any)['x-tagGroups'] = [
    {
      name: 'System',
      tags: [
        'Health',
      ],
    },
    {
      name: 'Authentication & Authorization',
      tags: [
        'Auth',
      ],
    },
    {
      name: 'User Management',
      tags: [
        'User',
      ],
    },
    {
      name: 'RBAC (Role-Based Access Control)',
      tags: [
        'Role',
        'Permission',
        'Role-Permission',
        'User-Role',
        'User-Permission',
      ],
    },
    {
      name: 'Holiday Management',
      tags: [
        'Holiday',
      ],
    },
  ];

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      tryItOutEnabled: true,
      deepLinking: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      defaultModelsExpandDepth: -1,
      defaultModelExpandDepth: 1,
      syntaxHighlight: {
        activate: true,
        theme: 'agate',
      },
    },
    customCss: `
      .swagger-ui .topbar { display: none; }
      @media (max-width: 768px) {
        .swagger-ui { font-size: 18px !important; }
        .swagger-ui .wrapper { padding: 0 8px; }
        .swagger-ui .scheme-container { padding: 12px 8px; }
        .swagger-ui .info { margin: 30px 0; }
        .swagger-ui .info .title { font-size: 32px !important; font-weight: 700; }
        .swagger-ui .info .description,
        .swagger-ui .info p { font-size: 18px !important; line-height: 1.7; }
        .swagger-ui .filter-container { margin: 25px 0; }
        .swagger-ui .filter-container label,
        .swagger-ui .filter .label { font-size: 18px !important; font-weight: 600; }
        .swagger-ui .opblock-tag { font-size: 22px !important; padding: 15px 8px; font-weight: 600; }
        .swagger-ui .opblock-tag small,
        .swagger-ui .opblock-tag-section small,
        .swagger-ui .opblock-tag .opblock-tag-description,
        .swagger-ui .opblock-tag span[class*="description"],
        .swagger-ui .opblock-tag .desc,
        .swagger-ui .opblock-tag-section .desc,
        .swagger-ui .opblock-tag-section [class*="desc"],
        .swagger-ui .opblock-tag .opblock-tag-no { font-size: 18px !important; font-weight: 400; line-height: 1.6; }
        .swagger-ui .opblock { margin: 0 0 18px 0; }
        .swagger-ui .opblock-summary { font-size: 18px !important; padding: 14px; }
        .swagger-ui .opblock-description-wrapper { font-size: 17px !important; padding: 14px; }
        .swagger-ui .btn { padding: 12px 20px; font-size: 18px !important; }
        .swagger-ui .btn-clear { font-size: 18px !important; }
        .swagger-ui label { font-size: 19px !important; font-weight: 600; }
        .swagger-ui h3, .swagger-ui h4, .swagger-ui h5 { font-size: 19px !important; font-weight: 600; }
        .swagger-ui .opblock-section-header { font-size: 19px !important; font-weight: 600; }
        .swagger-ui .opblock-section-header label { font-size: 19px !important; }
        .swagger-ui .opblock-section-header h4 { font-size: 19px !important; }
        .swagger-ui .parameter__name { font-size: 19px !important; font-weight: 600; }
        .swagger-ui .parameter__type { font-size: 18px !important; }
        .swagger-ui .parameter__description { font-size: 18px !important; }
        .swagger-ui .response-col_status { font-size: 19px !important; font-weight: 600; }
        .swagger-ui .response-col_description { font-size: 18px !important; }
        .swagger-ui .response .response-col_links { font-size: 18px !important; }
        .swagger-ui table thead th { font-size: 19px !important; font-weight: 600; }
        .swagger-ui table tbody td { font-size: 18px !important; }
        .swagger-ui .model-title { font-size: 19px !important; font-weight: 600; }
        .swagger-ui .prop-name { font-size: 18px !important; font-weight: 600; }
        .swagger-ui .prop-type { font-size: 18px !important; }
        .swagger-ui table { font-size: 18px !important; }
        .swagger-ui .table-container { font-size: 18px !important; }
        .swagger-ui .request-body { font-size: 19px !important; }
        .swagger-ui .request-body .request-body-title { font-size: 19px !important; font-weight: 600; }
        .swagger-ui .opblock-body pre { font-size: 16px !important; }
        .swagger-ui .body-param-content-type { font-size: 19px !important; font-weight: 600; }
        .swagger-ui .body-param-content-type label { font-size: 19px !important; }
        .swagger-ui .response-table thead th,
        .swagger-ui .responses-table thead th,
        .swagger-ui .responses-inner thead th { font-size: 19px !important; font-weight: 600; }
        .swagger-ui .response-table tbody td,
        .swagger-ui .responses-table tbody td,
        .swagger-ui .responses-inner tbody td { font-size: 18px !important; }
        .swagger-ui .response .response-col_status code { font-size: 18px !important; }
        .swagger-ui .opblock-description { font-size: 18px !important; }
        .swagger-ui .opblock-body { font-size: 18px !important; }
        .swagger-ui .opblock-body .opblock-description-wrapper { font-size: 18px !important; }
        .swagger-ui .markdown p, .swagger-ui .markdown code, .swagger-ui .markdown pre { font-size: 17px !important; }
        .swagger-ui .scheme-container label { font-size: 19px !important; }
        .swagger-ui .scheme-container .schemes { font-size: 18px !important; }
        .swagger-ui .auth-container label { font-size: 19px !important; }
        .swagger-ui .auth-btn-wrapper label { font-size: 19px !important; }
        .swagger-ui .authorization__btn { font-size: 19px !important; }
        .swagger-ui input[type=text],
        .swagger-ui input[type=password],
        .swagger-ui input[type=email],
        .swagger-ui input[type=url],
        .swagger-ui input[type=number],
        .swagger-ui textarea,
        .swagger-ui select { font-size: 18px !important; padding: 12px; }
        .swagger-ui .response-content-type { font-size: 16px !important; }
        .swagger-ui .info .base-url { font-size: 17px !important; }
        .swagger-ui .info .main { font-size: 18px !important; }
        .swagger-ui .info .version { font-size: 16px !important; }
      }
    `,
  });

  await app.listen(PORT, async () => {
    logger.log(`Application is running on: ${await app.getUrl()} : ${SERVER}`);
    logger.log(
      `Swagger documentation available at: ${await app.getUrl()}/api/docs`,
    );
  });
}
bootstrap();
