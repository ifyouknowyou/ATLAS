import { NextFunction, Request, Response } from 'express';
import { randomBytes } from 'node:crypto';

export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Generates and attaches a request id so every log line and error response
 * can be correlated. Stored on the request object for downstream use.
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const existing = req.header(REQUEST_ID_HEADER);
  const requestId = existing ?? randomBytes(8).toString('hex');
  res.setHeader(REQUEST_ID_HEADER, requestId);
  (req as Request & { requestId: string }).requestId = requestId;
  next();
}

export function requestIdOf(req: Request): string {
  return (req as Request & { requestId: string }).requestId ?? 'unknown';
}