import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

interface LogMeta {
  requestId?: string;
  organizationId?: string;
  userId?: string;
  durationMs?: number;
  [key: string]: unknown;
}

@Injectable()
export class StructuredLoggerService {
  private readonly logger = new Logger('ATLAS');

  private sanitize(meta: LogMeta): LogMeta {
    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'private', 'evidence', 'credential'];
    const out: LogMeta = { ...meta };
    for (const key of Object.keys(out)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        out[key] = '[REDACTED]';
      }
    }
    return out;
  }

  info(message: string, meta: LogMeta = {}) {
    this.logger.log(JSON.stringify({ level: 'info', message, ...this.sanitize(meta), timestamp: new Date().toISOString() }));
  }

  warn(message: string, meta: LogMeta = {}) {
    this.logger.warn(JSON.stringify({ level: 'warn', message, ...this.sanitize(meta), timestamp: new Date().toISOString() }));
  }

  error(message: string, error?: Error, meta: LogMeta = {}) {
    const entry: Record<string, unknown> = {
      level: 'error',
      message,
      ...this.sanitize(meta),
      timestamp: new Date().toISOString(),
      errorId: randomUUID(),
    };
    if (error) {
      entry.error = error.message;
      entry.stack = process.env.NODE_ENV === 'development' ? error.stack : undefined;
    }
    this.logger.error(JSON.stringify(entry));
  }

  child(context: Record<string, unknown>) {
    const child = { ...(this as any) } as StructuredLoggerService;
    const originalInfo = child.info.bind(child);
    child.info = (message: string, meta: LogMeta = {}) => originalInfo(message, { ...context, ...meta });
    return child;
  }
}