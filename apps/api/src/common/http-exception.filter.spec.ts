import { ArgumentsHost, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { API_ERROR_CODES } from '@atlas/shared';
import { AllExceptionsFilter } from './http-exception.filter';

function hostWith(exception: unknown) {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const response = { status, json };
  const request = {
    method: 'GET',
    path: '/test',
    requestId: 'req_123',
    header: () => 'req_123',
  };
  const switchToHttp = jest.fn(() => ({
    getRequest: () => request,
    getResponse: () => response,
  }));
  const host = {
    switchToHttp,
    getHandler: () => null,
    getClass: () => null,
  } as unknown as ArgumentsHost;

  const filter = new AllExceptionsFilter();
  filter.catch(exception, host);
  return { status, json: json.mock.calls[0]?.[0] };
}

describe('AllExceptionsFilter', () => {
  it('maps NotFoundException to the API error contract', () => {
    const { status, json } = hostWith(new NotFoundException('Case missing'));
    expect(status).toHaveBeenCalledWith(404);
    expect(json.error.code).toBe(API_ERROR_CODES.NOT_FOUND);
    expect(json.error.message).toBe('Case missing');
    expect(json.error.requestId).toBe('req_123');
  });

  it('maps ForbiddenException to FORBIDDEN', () => {
    const { json } = hostWith(new ForbiddenException('nope'));
    expect(json.error.code).toBe(API_ERROR_CODES.FORBIDDEN);
  });

  it('flattens validation errors into field issues', () => {
    const boom = new BadRequestException([
      { property: 'title', constraints: { isString: 'title must be a string' } },
    ]);
    const { json } = hostWith(boom);
    expect(json.error.code).toBe(API_ERROR_CODES.VALIDATION_FAILED);
    expect(json.error.details).toEqual([
      { field: 'title', message: 'title must be a string' },
    ]);
  });

  it('never leaks internal exception messages on 500s', () => {
    const { status, json } = hostWith(new Error('DATABASE_PASSWORD=secret'));
    expect(status).toHaveBeenCalledWith(500);
    expect(json.error.code).toBe(API_ERROR_CODES.INTERNAL);
    expect(json.error.message).not.toContain('secret');
  });
});