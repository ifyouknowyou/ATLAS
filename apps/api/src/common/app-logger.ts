/**
 * Minimal structured JSON logging. Replaces ad-hoc console calls so log
 * lines are machine-parseable and correlatable via request ids.
 */
type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  ts: string;
  message: string;
  context?: string;
  [key: string]: unknown;
}

export class AppLogger {
  constructor(private readonly context: string) {}

  info(message: string, meta: Record<string, unknown> = {}): void {
    this.write('info', message, meta);
  }

  warn(message: string, meta: Record<string, unknown> = {}): void {
    this.write('warn', message, meta);
  }

  error(message: string, meta: Record<string, unknown> = {}): void {
    this.write('error', message, meta);
  }

  private write(
    level: LogLevel,
    message: string,
    meta: Record<string, unknown>,
  ): void {
    const entry: LogEntry = {
      level,
      ts: new Date().toISOString(),
      message,
      context: this.context,
      ...meta,
    };
    const line = JSON.stringify(entry);
    if (level === 'error') {
      // eslint-disable-next-line no-console
      console.error(line);
    } else {
      // eslint-disable-next-line no-console
      console.log(line);
    }
  }
}