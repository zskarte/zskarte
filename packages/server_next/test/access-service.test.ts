import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Database } from '../src/db/client.js';
import * as repository from '../src/modules/access/repository.js';
import * as service from '../src/modules/access/service.js';
import type { Context, Scope } from '../src/trpc/context.js';

vi.mock('../src/modules/access/repository.js', () => ({
  insert: vi.fn(),
  list: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  deleteExpired: vi.fn(),
}));

const ORGANIZATION_ID = 'ca548097-df0f-4862-8bd3-b104bf537bd8';
const OPERATION_ID = '11111111-1111-4111-8111-111111111111';

const context = () => ({
  db: {} as Database,
  scope: { organizationId: ORGANIZATION_ID } as Scope,
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn(), debug: vi.fn() },
  requestIp: null,
  requestPath: '/trpc/access',
  userAgent: null,
  authSession: null,
  user: null,
  session: null,
  role: 'organization',
}) as Context & { scope: Scope };

beforeEach(() => vi.clearAllMocks());

describe('access service', () => {
  it('creates a persistent 32-character long token', async () => {
    vi.mocked(repository.insert).mockResolvedValue({} as never);

    const result = await service.generate(context(), {
      operationId: OPERATION_ID,
      type: 'read',
      tokenType: 'long',
    });

    expect(result.accessToken).toMatch(/^[0-9a-f]{32}$/);
    expect(repository.insert).toHaveBeenCalledWith(
      expect.anything(),
      { organizationId: ORGANIZATION_ID },
      result.accessToken,
      expect.objectContaining({ operationId: OPERATION_ID, expiresOn: null, active: true }),
    );
  });

  it('creates a six-digit token expiring in fifteen minutes', async () => {
    vi.mocked(repository.insert).mockResolvedValue({} as never);
    const before = Date.now();

    const result = await service.generate(context(), {
      operationId: OPERATION_ID,
      type: 'write',
      tokenType: 'short',
    });

    expect(result.accessToken).toMatch(/^\d{6}$/);
    const values = vi.mocked(repository.insert).mock.calls[0]?.[3];
    expect(values?.expiresOn?.getTime()).toBeGreaterThanOrEqual(before + 15 * 60 * 1000);
    expect(values?.expiresOn?.getTime()).toBeLessThanOrEqual(Date.now() + 15 * 60 * 1000);
  });

  it('does not return a foreign or unknown access', async () => {
    vi.mocked(repository.findById).mockResolvedValue(undefined);
    await expect(service.byId(context(), '33333333-3333-4333-8333-333333333333')).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });
});
