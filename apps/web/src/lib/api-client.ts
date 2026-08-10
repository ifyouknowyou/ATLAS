import {
  API_ERROR_CODES,
  type ApiErrorBody,
  type ApiErrorCode,
} from '@atlas/shared';

const API_PREFIX = '/api';

/**
 * Client-side API wrapper. Attaches the bearer token from auth storage and
 * maps the consistent ApiErrorBody contract into typed ApiError instances.
 */
export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly status: number,
    readonly requestId?: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  token?: string | null;
}

export async function apiRequest<T>(
  path: string,
  { body, token, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_PREFIX}${path}`, {
    ...init,
    headers: {
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'omit',
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json');

  if (!response.ok) {
    const payload = isJson ? ((await response.json()) as ApiErrorBody) : null;
    const requestId = response.headers.get('x-request-id') ?? undefined;
    throw new ApiError(
      payload?.error.code ?? API_ERROR_CODES.INTERNAL,
      payload?.error.message ?? `Request failed (${response.status})`,
      response.status,
      requestId,
      payload?.error.details,
    );
  }

  if (!isJson) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, token?: string | null) =>
    apiRequest<T>(path, { token, method: 'GET' }),
  post: <T>(path: string, body: unknown, token?: string | null) =>
    apiRequest<T>(path, { token, method: 'POST', body }),
  patch: <T>(path: string, body: unknown, token?: string | null) =>
    apiRequest<T>(path, { token, method: 'PATCH', body }),
  delete: <T>(path: string, token?: string | null) =>
    apiRequest<T>(path, { token, method: 'DELETE' }),
};