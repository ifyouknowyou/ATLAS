import { Injectable, Scope } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { StructuredLoggerService } from './structured-logger.service';

interface ClientError {
  errorId: string;
  message: string;
  timestamp: string;
}

@Injectable({ scope: Scope.DEFAULT })
export class ErrorTrackerService {
  constructor(private readonly logger: StructuredLoggerService) {}

  capture(error: Error, context: Record<string, unknown> = {}) {
    this.logger.error(error.message, error, {
      errorId: randomUUID(),
      ...context,
    });
  }

  formatClientError(error: { message?: string; status?: number }): ClientError {
    return {
      errorId: randomUUID(),
      message: error.message ?? 'Unexpected server error',
      timestamp: new Date().toISOString(),
    };
  }
}