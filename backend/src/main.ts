import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { join } from 'path';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              return `${timestamp} [${context || 'App'}] ${level}: ${message}`;
            }),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
      ],
    }),
  });

  const config = app.get(ConfigService);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    }),
  );

  const uploadsDir = join(__dirname, '..', 'uploads');
  app.useStaticAssets(uploadsDir, {
    prefix: '/uploads/',
    fallthrough: true,
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=86400');
    },
  });

  // Fallback para /uploads/* cuando el archivo no existe:
  // responder con un SVG placeholder + Content-Type imagen + CORP cross-origin.
  // Sin este handler, el AllExceptionsFilter respondería con application/json,
  // y Chrome bloquearía la respuesta con net::ERR_BLOCKED_BY_ORB cuando es solicitada como <img>.
  const PLACEHOLDER_SVG = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#f3f4f6"/>
      <g fill="#9ca3af" font-family="system-ui, sans-serif" text-anchor="middle">
        <text x="200" y="155" font-size="48">🪵</text>
        <text x="200" y="195" font-size="14">Imagen no disponible</text>
      </g>
    </svg>`,
    'utf-8',
  );
  app.use('/uploads', (_req, res) => {
    res.status(404);
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(PLACEHOLDER_SVG);
  });

  // CORS: acepta una lista separada por comas en FRONTEND_URL para soportar staging + prod
  const frontendUrls = (config.get<string>('FRONTEND_URL') || 'http://localhost:5173')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);
  app.enableCors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // herramientas server-side
      if (frontendUrls.includes(origin)) return cb(null, true);
      return cb(new Error(`Origen no permitido: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    maxAge: 600,
  });

  // Límite explícito de payload para prevenir abuso
  const bodyLimit = config.get<string>('BODY_LIMIT', '2mb');
  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ limit: bodyLimit, extended: true }));

  // Global pipes, filters, interceptors
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Manos Creadoras API')
    .setDescription('API SaaS marketplace para artesanías hechas a mano')
    .setVersion('2.0')
    .addBearerAuth()
    .addTag('Auth', 'Autenticación y registro')
    .addTag('Users', 'Gestión de usuarios')
    .addTag('Products', 'Catálogo de productos')
    .addTag('Orders', 'Gestión de pedidos')
    .addTag('Inventory', 'Control de inventario')
    .addTag('Clients', 'Gestión de clientes')
    .addTag('Dashboard', 'Analítica y métricas')
    .addTag('Banners', 'Banners promocionales')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  Logger.log(`Server running on http://localhost:${port}`, 'Bootstrap');
  Logger.log(`Swagger docs at http://localhost:${port}/api/docs`, 'Bootstrap');
}
bootstrap();
