/**
 * Consistent API error contract shared by the API and consumed by the web app.
 *
 * Every non-2xx response from the ATLAS API has this shape so clients can
 * present errors uniformly without sniffing message strings.
 */

/** Stable machine-readable error codes. */
export const API_ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INTERNAL: 'INTERNAL_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export interface ApiErrorBody {
  error: {
    /** Stable code, never a raw exception message. */
    code: ApiErrorCode;
    /** Safe, user-presentable message. */
    message: string;
    /** Correlatable request id (also set in headers). */
    requestId: string;
    /** Optional structured details (e.g. validation field errors). */
    details?: unknown;
  };
}

export interface ApiValidationIssue {
  field: string;
  message: string;
}