import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_CONFIG, AppConfig } from '../config/app-config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionsService } from './sessions.service';
import { LoginThrottleGuard } from './login-throttle.guard';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => ({
        secret: config.authJwtSecret,
        // expiresIn is typed as a jsonwebtoken StringValue template literal;
        // our env string is validated at boot and always matches.
        signOptions: { expiresIn: config.authJwtExpiresIn as never },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionsService, LoginThrottleGuard, AuthGuard],
  exports: [AuthGuard, SessionsService],
})
export class AuthModule {}