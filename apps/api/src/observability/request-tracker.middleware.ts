import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      traceId?: string;
      startTime?: number;
    }
  }
}

@Injectable()
export class RequestTrackerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id']?.toString() ?? randomUUID();
    const traceId = req.headers['x-trace-id']?.toString() ?? randomUUID();
    req.requestId = requestId;
    req.traceId = traceId;
    req.startTime = Date.now();
    res.setHeader('x-request-id', requestId);
    next();
  }
}