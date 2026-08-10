import { UnauthorizedException } from '@nestjs/common';

/**
 * Emitted on failed email/password verification so clients can distinguish
 * bad credentials from an expired/revoked session (both are HTTP 401).
 */
export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super('Invalid credentials');
    this.name = 'InvalidCredentialsException';
  }
}