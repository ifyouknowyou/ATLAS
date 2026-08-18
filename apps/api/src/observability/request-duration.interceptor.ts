import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StructuredLoggerService } from './structured-logger.service';

@Injectable()
export class RequestDurationInterceptor implements NestInterceptor {
  constructor(private readonly logger: StructuredLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request & { requestId?: string; organizationId?: string; userId?: string }>();
    const start = Date.now();
    return next.handle().pipe(
      tap({
        complete: () => {
          const duration = Date.now() - start;
          this.logger.info('request complete', {
            requestId: request.requestId,
            organizationId: request.organizationId,
            userId: request.userId,
            method: request.method,
            path: request.route?.path ?? request.path,
            durationMs: duration,
          });
        },
      }),
    );
  }
}