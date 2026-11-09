import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { APP_CONFIG } from '../config/app-config';
import { AppConfig, validateEnv } from '../config/env';

/**
 * Global configuration module. Registers env parsing (with validation)
 * and exposes the typed APP_CONFIG provider.
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../../.env')],
      validate: validateEnv,
    }),
  ],
  providers: [
    {
      provide: APP_CONFIG,
      // @nestjs/config loads .env into process.env via dotenv during boot,
      // so validating process.env gives us the full, validated snapshot.
      useFactory: (): AppConfig => validateEnv(process.env),
    },
  ],
  exports: [APP_CONFIG],
})
export class AppConfigModule {}