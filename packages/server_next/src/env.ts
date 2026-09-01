import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const DEV_AUTH_SECRET = 'dev-only-secret-change-me-please-32ch';
const DEV_SIGN_PASSPHRASE = 'E1WaoyNCpnxI9kZL3jSkcn0i4jqiHm1VmZqyEQWFV4Y=';

const booleanish = (defaultValue: boolean) =>
  z
    .string()
    .default(defaultValue ? 'true' : 'false')
    .transform((value) => ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase()));

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(1338),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  DATABASE_URL: z.string().optional(),
  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.coerce.number().int().positive().default(55432),
  DATABASE_NAME: z.string().default('zskarte_next'),
  DATABASE_MAINTENANCE_DB: z.string().default('postgres'),
  DATABASE_USERNAME: z.string().default('postgres'),
  DATABASE_PASSWORD: z.string().default('supersecret123'),
  DATABASE_SCHEMA: z.string().default('public'),
  DATABASE_SSL: booleanish(false),
  DATABASE_SSL_REJECT_UNAUTHORIZED: booleanish(true),
  DATABASE_POOL_MIN: z.coerce.number().int().nonnegative().default(2),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),
  RUN_MIGRATIONS_ON_BOOT: booleanish(true),

  BETTER_AUTH_SECRET: z.string().min(16).default(DEV_AUTH_SECRET),
  BETTER_AUTH_URL: z.string().optional(),
  TRUSTED_ORIGINS: z.string().default('http://localhost:4300'),

  SIGN_KEY_TYPE: z.enum(['rsa', 'ed25519']).default('ed25519'),
  SIGN_PRIVATE_KEY_PASSPHRASE: z.string().min(8).default(DEV_SIGN_PASSPHRASE),
  SKIP_EXTERNAL_IP: booleanish(false),

  STORAGE_PROVIDER: z.enum(['local', 'azure']).default('local'),
  STORAGE_LOCAL_DIR: z.string().default('public/uploads'),
  STORAGE_AZURE_ACCOUNT: z.string().optional(),
  STORAGE_AZURE_ACCOUNT_KEY: z.string().optional(),
  STORAGE_AZURE_CONTAINER_NAME: z.string().optional(),
  STORAGE_AZURE_SERVICE_BASE_URL: z.string().optional(),

  MAPLAYER_GENERATION_ENABLED: booleanish(false),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

const raw = parsed.data;
const isProduction = raw.NODE_ENV === 'production';

if (isProduction) {
  const insecure: string[] = [];
  if (raw.BETTER_AUTH_SECRET === DEV_AUTH_SECRET) insecure.push('BETTER_AUTH_SECRET');
  if (raw.SIGN_PRIVATE_KEY_PASSPHRASE === DEV_SIGN_PASSPHRASE) insecure.push('SIGN_PRIVATE_KEY_PASSPHRASE');
  if (insecure.length > 0) {
    throw new Error(`Refusing to start in production with development defaults for: ${insecure.join(', ')}`);
  }
}

const databaseUrl =
  raw.DATABASE_URL ??
  `postgres://${encodeURIComponent(raw.DATABASE_USERNAME)}:${encodeURIComponent(raw.DATABASE_PASSWORD)}@${raw.DATABASE_HOST}:${raw.DATABASE_PORT}/${raw.DATABASE_NAME}`;

export const env = Object.freeze({
  ...raw,
  DATABASE_URL: databaseUrl,
  BETTER_AUTH_URL: raw.BETTER_AUTH_URL ?? `http://localhost:${raw.PORT}`,
  TRUSTED_ORIGINS: raw.TRUSTED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0),
  isProduction,
  isTest: raw.NODE_ENV === 'test',
});

export type Env = typeof env;
