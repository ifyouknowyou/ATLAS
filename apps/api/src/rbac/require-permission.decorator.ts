import { SetMetadata, CustomDecorator } from '@nestjs/common';
import type { Permission } from '@atlas/shared';

export const REQUIRED_PERMISSIONS_KEY = 'requiredPermissions';

/**
 * Declares which permission(s) a route requires. When an array is given all
 * listed permissions are required (AND). Evaluated by PermissionsGuard after
 * authentication.
 */
export const RequirePermission = (
  permission: Permission | Permission[],
): CustomDecorator<string> =>
  SetMetadata(
    REQUIRED_PERMISSIONS_KEY,
    Array.isArray(permission) ? permission : [permission],
  );

export function requiredPermissionsOf(
  handler: object,
  controller: object,
): Permission[] {
  const value =
    Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, handler) ??
    Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, controller);
  return (value as Permission[] | undefined) ?? [];
}