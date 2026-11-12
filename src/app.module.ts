import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'auditoria'),
        password: config.get<string>('DB_PASSWORD', 'auditoria'),
        database: config.get<string>('DB_NAME', 'auditoria'),
        autoLoadEntities: true,
        synchronize: true,
        logging: config.get<string>('DB_LOGGING') === 'true',
      }),
    }),
    AuditoriaModule,
    HealthModule,
  ],
})
export class AppModule {}
