import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StructuredLoggerService } from './structured-logger.service';
import { AuthenticatedRequest } from '../auth/principal';

@Injectable()
export class RequestDurationInterceptor implements NestInterceptor {
  constructor(private readonly logger: StructuredLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const start = Date.now();
    return next.handle().pipe(
      tap({
        complete: () => {
          const duration = Date.now() - start;
          this.logger.info('request complete', {
            requestId: request.requestId,
            organizationId: request.principal?.organizationId,
            userId: request.principal?.userId,
            method: request.method,
            path: request.url,
            durationMs: duration,
          });
        },
      }),
    );
  }
}