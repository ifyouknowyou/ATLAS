import { NotFoundException } from '@nestjs/common';

/**
 * Raises a stable 404 when an org-scoped lookup comes back empty.
 * Ownership is enforced by the caller scoping queries with the principal's
 * organizationId before this is ever reached.
 */
export function requireFound<T>(result: T | null | undefined, label: string): T {
  if (!result) {
    throw new NotFoundException(`${label} not found or not accessible`);
  }
  return result;
}