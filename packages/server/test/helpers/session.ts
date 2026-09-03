import { pino } from 'pino';
import { vi } from 'vitest';
import type { Role } from '../../src/auth/roles.js';
import type { Database } from '../../src/db/client.js';
import type { Logger } from '../../src/lib/logger.js';
import {
  type AuthSession,
  type Context,
  createContextInner,
  type CreateInnerContextOptions,
} from '../../src/trpc/context.js';
export {
  type AuthSession,
  type Context,
  createContextInner,
  type CreateInnerContextOptions,
} from '../../src/trpc/context.js';
import { TEST_ORG_ID, TEST_SESSION_ID, TEST_USER_ID } from './fixtures.js';
import { createMockDb } from './mock-db.js';

export interface CreateTestSessionOptions {
  userId?: string;
  userName?: string;
  userEmail?: string;
  username?: string;
  sessionId?: string;
  token?: string;
  expiresAt?: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  permission?: string | null;
  userOverrides?: Partial<AuthSession['user']>;
  sessionOverrides?: Partial<AuthSession['session']>;
}

/**
 * Creates a standardized AuthSession for tests with configurable role, IDs, and custom overrides.
 */
export function createTestSession(
  role: Role = 'organization',
  organizationId: string | null = TEST_ORG_ID,
  operationId: string | null = null,
  options: CreateTestSessionOptions = {},
): AuthSession {
  const userId = options.userId ?? TEST_USER_ID;
  const now = new Date();

  return {
    user: {
      id: userId,
      name: options.userName ?? 'Test User',
      email: options.userEmail ?? 'test@example.com',
      emailVerified: true,
      image: null,
      username: options.username ?? 'testuser',
      organizationId,
      zsRole: role,
      createdAt: now,
      updatedAt: now,
      ...options.userOverrides,
    },
    session: {
      id: options.sessionId ?? TEST_SESSION_ID,
      token: options.token ?? 'test-session-token',
      userId,
      expiresAt: options.expiresAt ?? new Date(Date.now() + 3600_000),
      ipAddress: options.ipAddress ?? '127.0.0.1',
      userAgent: options.userAgent ?? 'vitest-test-agent',
      operationId,
      organizationId,
      permission: options.permission ?? null,
      createdAt: now,
      updatedAt: now,
      ...options.sessionOverrides,
    },
  };
}

/**
 * Creates a silent logger for unit and router tests to keep test outputs clean.
 */
export function createSilentLogger(): Logger {
  return pino({ level: 'silent' });
}

export type MockLogger = {
  info: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  fatal: ReturnType<typeof vi.fn>;
  debug: ReturnType<typeof vi.fn>;
  trace: ReturnType<typeof vi.fn>;
  child: ReturnType<typeof vi.fn>;
} & Logger;

/**
 * Creates a mock logger with spyable methods for asserting on log emissions.
 */
export function createMockLogger(): MockLogger {
  const logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    child: vi.fn(() => logger),
  };
  return logger as unknown as MockLogger;
}

export interface CreateTestContextOptions extends Partial<CreateInnerContextOptions> {
  role?: Role;
  organizationId?: string | null;
  operationId?: string | null;
  sessionOptions?: CreateTestSessionOptions;
}

/**
 * Creates a standard tRPC Context for testing routers and procedures.
 */
export async function createTestContext(options: CreateTestContextOptions = {}): Promise<Context> {
  let authSession = options.authSession;
  if (
    authSession === undefined &&
    (options.role !== undefined ||
      options.organizationId !== undefined ||
      options.operationId !== undefined ||
      options.sessionOptions !== undefined)
  ) {
    authSession = createTestSession(
      options.role ?? 'organization',
      options.organizationId !== undefined ? options.organizationId : TEST_ORG_ID,
      options.operationId !== undefined ? options.operationId : null,
      options.sessionOptions,
    );
  }

  const db = options.db ?? (createMockDb().db as Database);
  const logger = options.logger ?? createSilentLogger();

  return createContextInner({
    authSession,
    db,
    logger,
    requestIp: options.requestIp ?? '127.0.0.1',
    requestPath: options.requestPath ?? 'internal',
    userAgent: options.userAgent ?? 'vitest-test-agent',
    req: options.req,
  });
}
