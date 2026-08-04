import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import * as mariadb from 'mariadb';
import { MODELS } from './database/models';
import {
  AdminPropertiesController,
  AgencyController,
  AppointmentsController,
  AuthController,
  ClientsController,
  DashboardController,
  ImagesController,
  InquiriesController,
  PropertiesController,
} from './app.controller';
import {
  AgencyService,
  AuthService,
  CrmService,
  DashboardService,
  PropertiesService,
} from './app.service';
import { JwtAuthGuard } from './common/auth.guard';
import {
  LocalStorageProvider,
  StorageProvider,
} from './storage/storage.service';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        dialect: 'mariadb',
        dialectModule: mariadb,
        host: c.getOrThrow('DB_HOST'),
        port: Number(c.get('DB_PORT', 3306)),
        database: c.getOrThrow('DB_NAME'),
        username: c.getOrThrow('DB_USER'),
        password: c.getOrThrow('DB_PASSWORD'),
        models: MODELS,
        autoLoadModels: true,
        synchronize: false,
        logging: false,
      }),
    }),
    SequelizeModule.forFeature(MODELS),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        secret: c.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: '8h' },
      }),
    }),
  ],
  controllers: [
    AuthController,
    AgencyController,
    PropertiesController,
    AdminPropertiesController,
    ImagesController,
    InquiriesController,
    ClientsController,
    AppointmentsController,
    DashboardController,
  ],
  providers: [
    AuthService,
    PropertiesService,
    CrmService,
    AgencyService,
    DashboardService,
    JwtAuthGuard,
    LocalStorageProvider,
    { provide: StorageProvider, useExisting: LocalStorageProvider },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
