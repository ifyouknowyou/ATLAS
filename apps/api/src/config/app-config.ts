/**
 * Injection token for the typed application configuration (see env.ts).
 * The provider is registered in AppConfigModule.
 */
export const APP_CONFIG = Symbol.for('APP_CONFIG');
export type { AppConfig } from './env';
export type { RawEnv } from './env';