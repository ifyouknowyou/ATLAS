/**
 * Typed application configuration, validated once at boot from environment.
 * Secrets (JWT secret, DB credentials) are only ever read server-side here.
 */

export interface AppConfig {
  nodeEnv: 'development' | 'test' | 'production';
  apiPort: number;
  databaseUrl: string;
  corsOrigins: string[];
  authJwtSecret: string;
  authJwtExpiresIn: string;
  authBcryptRounds: number;
  demoOwnerEmail: string;
  demoOwnerPassword: string;
  /** Server-side Anthropic API key. Optional — AI endpoints report 503 when absent. */
  anthropicApiKey?: string;
  /** Claude model to use for the assistant (default claude-opus-5). */
  anthropicModel: string;
  /** Primary AI provider. Supported values: gemini and anthropic. */
  aiProvider?: 'gemini' | 'anthropic';
  geminiApiKey?: string;
  geminiModel?: string;
  tavilyApiKey?: string;
  aiTemperature?: number;
  aiMaxOutputTokens?: number;
  aiEnableWebResearch?: boolean;
  /** Root directory for evidence file storage (Phase 5). */
  storageDir: string;
  /** Maximum accepted upload size in MiB (Phase 5). */
  maxUploadMb: number;
  /** Lifetime (seconds) of short-lived signed download URLs (Phase 5). */
  signedUrlTtlS: number;
  /** Background job poll interval (ms) for the in-process queue (Phase 5). */
  jobsPollIntervalMs: number;
}

export type RawEnv = Record<string, unknown> & NodeJS.ProcessEnv;

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0;

function requiredString(env: RawEnv, key: string): string {
  const val = env[key];
  if (!isNonEmptyString(val)) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
}

function parseList(value: unknown): string[] {
  return typeof value === 'string'
    ? value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
}

function intValue(value: unknown, fallback: number, key: string): number {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new Error(`Environment variable ${key} must be an integer`);
  }
  return parsed;
}

function floatValue(value: unknown, fallback: number, key: string): number {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return parsed;
}

function boolValue(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value === true || value === 'true' || value === '1';
}

/** Validates a raw env object and returns a fully typed AppConfig. */
export function validateEnv(env: RawEnv): AppConfig {
  const nodeEnv = env.NODE_ENV ?? 'development';
  const snapshot: AppConfig = {
    nodeEnv: nodeEnv as AppConfig['nodeEnv'],
    apiPort: intValue(env.API_PORT, 4100, 'API_PORT'),
    databaseUrl: requiredString(env, 'DATABASE_URL'),
    corsOrigins: parseList(env.CORS_ORIGINS),
    authJwtSecret: requiredString(env, 'AUTH_JWT_SECRET'),
    authJwtExpiresIn: isNonEmptyString(env.AUTH_JWT_EXPIRES_IN)
      ? env.AUTH_JWT_EXPIRES_IN
      : '12h',
    authBcryptRounds: intValue(env.AUTH_BCRYPT_ROUNDS, 12, 'AUTH_BCRYPT_ROUNDS'),
    demoOwnerEmail: isNonEmptyString(env.DEMO_OWNER_EMAIL)
      ? env.DEMO_OWNER_EMAIL
      : 'admin@atlas.demo',
    demoOwnerPassword: isNonEmptyString(env.DEMO_OWNER_PASSWORD)
      ? env.DEMO_OWNER_PASSWORD
      : 'AtlasDemo#2026',
    anthropicApiKey: isNonEmptyString(env.ANTHROPIC_API_KEY)
      ? env.ANTHROPIC_API_KEY
      : undefined,
    anthropicModel: isNonEmptyString(env.ANTHROPIC_MODEL)
      ? env.ANTHROPIC_MODEL
      : 'claude-opus-5',
    aiProvider: env.AI_PROVIDER === 'anthropic' ? 'anthropic' : 'gemini',
    geminiApiKey: isNonEmptyString(env.GEMINI_API_KEY)
      ? env.GEMINI_API_KEY
      : undefined,
    geminiModel: isNonEmptyString(env.GEMINI_MODEL)
      ? env.GEMINI_MODEL
      : 'gemini-2.0-flash',
    tavilyApiKey: isNonEmptyString(env.TAVILY_API_KEY)
      ? env.TAVILY_API_KEY
      : undefined,
    aiTemperature: floatValue(env.AI_TEMPERATURE, 0.3, 'AI_TEMPERATURE'),
    aiMaxOutputTokens: intValue(env.AI_MAX_OUTPUT_TOKENS, 4096, 'AI_MAX_OUTPUT_TOKENS'),
    aiEnableWebResearch: boolValue(env.AI_ENABLE_WEB_RESEARCH, true),
    storageDir: isNonEmptyString(env.ATLAS_STORAGE_DIR)
      ? env.ATLAS_STORAGE_DIR
      : '/home/who/All Project/ATLAS/apps/api/.storage',
    maxUploadMb: intValue(env.ATLAS_MAX_UPLOAD_MB, 25, 'ATLAS_MAX_UPLOAD_MB'),
    signedUrlTtlS: intValue(env.ATLAS_SIGNED_URL_TTL_S, 120, 'ATLAS_SIGNED_URL_TTL_S'),
    jobsPollIntervalMs: intValue(env.ATLAS_JOBS_POLL_INTERVAL_MS, 2000, 'ATLAS_JOBS_POLL_INTERVAL_MS'),
  };
  return snapshot;
}