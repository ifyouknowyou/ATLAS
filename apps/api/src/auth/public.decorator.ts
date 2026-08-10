import { SetMetadata, CustomDecorator } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route handler (or controller) as reachable without authentication.
 * Only intended for health checks and the initial login flow.
 */
export const Public = (): CustomDecorator<string> =>
  SetMetadata(IS_PUBLIC_KEY, true);

export function isPublicTarget(handler: object, controller: object): boolean {
  const handlerValue = Reflect.getMetadata(IS_PUBLIC_KEY, handler);
  const controllerValue = Reflect.getMetadata(IS_PUBLIC_KEY, controller);
  return Boolean(handlerValue ?? controllerValue);
}