import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/response.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',') ?? ['http://localhost:4200'],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          message: 'Revisá los datos ingresados',
          errors: errors.map((e) => ({
            field: e.property,
            messages: Object.values(e.constraints ?? {}),
          })),
        }),
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useStaticAssets(
    join(process.cwd(), process.env.UPLOAD_DIR ?? 'uploads'),
    { prefix: '/uploads/' },
  );
  const config = new DocumentBuilder()
    .setTitle('Horizonte Propiedades API')
    .setDescription('API REST para gestión inmobiliaria')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, config),
  );
  await app.listen(Number(process.env.PORT ?? 3000));
}
void bootstrap();
