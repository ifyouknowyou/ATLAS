import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { APP_CONFIG, AppConfig } from './config/app-config';
import { requestIdMiddleware } from './common/request-id';
import { AllExceptionsFilter } from './common/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  const config = app.get<AppConfig>(APP_CONFIG);

  app.use(requestIdMiddleware);
  app.use(helmet());

  app.enableCors({
    origin: config.corsOrigins,
    credentials: false,
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      validationError: { target: false, value: false },
      // Keep raw ValidationError objects so the error filter can emit
      // structured { field, message } issues (Nest 11 otherwise flattens).
      exceptionFactory: (errors) => new BadRequestException(errors),
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  await app.listen(config.apiPort);
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      level: 'info',
      message: `ATLAS API listening on :${config.apiPort} (${config.nodeEnv})`,
    }),
  );
}

void bootstrap();