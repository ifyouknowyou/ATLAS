import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  API_ERROR_CODES,
  ApiErrorBody,
  ApiErrorCode,
  ApiValidationIssue,
} from '@atlas/shared';
import { requestIdOf } from './request-id';
import { InvalidCredentialsException } from '../auth/invalid-credentials.exception';
import { formatValidationIssues } from './validation.utils';

interface ErrorResponseLike {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

/**
 * Converts every thrown error into the consistent `ApiErrorBody` contract.
 * Internal errors never leak stack traces or raw messages to clients.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = requestIdOf(request);

    const status = this.statusOf(exception);
    const code: ApiErrorCode = this.codeOf(exception, status);
    const { message, details } = this.messageAndDetails(exception, status);

    if (status >= 500) {
      // Always log server-side; never return internals to the client.
      this.logError(status, code, message, request, exception);
    }

    const body: ApiErrorBody = { error: { code, message, requestId, details } };
    response.status(status).json(body);
  }

  private statusOf(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private codeOf(exception: unknown, status: number): ApiErrorCode {
    if (exception instanceof InvalidCredentialsException) {
      return API_ERROR_CODES.INVALID_CREDENTIALS;
    }
    if (exception instanceof HttpException && status === HttpStatus.BAD_REQUEST) {
      return API_ERROR_CODES.VALIDATION_FAILED;
    }
    const map: Partial<Record<number, ApiErrorCode>> = {
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
    };
    return map[status] ?? API_ERROR_CODES.INTERNAL;
  }

  private messageAndDetails(
    exception: unknown,
    status: number,
  ): { message: string; details?: unknown } {
    if (exception instanceof BadRequestException) {
      return formatBadRequest(exception);
    }
    if (exception instanceof HttpException) {
      const raw = exception.getResponse() as ErrorResponseLike;
      const fallback = status === HttpStatus.NOT_FOUND ? 'Resource not found' : 'Request failed';
      const candidate = raw?.message;
      const message = Array.isArray(candidate) ? candidate.join('; ') : candidate;
      return { message: message ?? fallback };
    }
    return { message: 'Internal server error' };
  }

  private logError(
    status: number,
    code: ApiErrorCode,
    message: string,
    request: Request,
    exception: unknown,
  ): void {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        level: 'error',
        code,
        status,
        message,
        requestId: requestIdOf(request),
        method: request.method,
        path: request.path,
        source: exception instanceof Error ? exception.message : 'unknown',
      }),
    );
  }
}

function formatBadRequest(
  exception: BadRequestException,
): { message: string; details?: ApiValidationIssue[] } {
  const raw = exception.getResponse() as ErrorResponseLike;
  if (Array.isArray(raw?.message)) {
    const issues = formatValidationIssues(raw.message);
    if (issues.length > 0) {
      return {
        message: 'Validation failed',
        details: issues,
      };
    }
    return { message: raw.message.join('; ') };
  }
  const message = typeof raw?.message === 'string' ? raw.message : 'Bad request';
  return { message };
}