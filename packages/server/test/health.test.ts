import { describe, expect, it } from 'vitest';
import { createContextInner } from '../src/trpc/context.js';
import { appRouter } from '../src/trpc/router.js';
import { createCallerFactory } from '../src/trpc/trpc.js';

describe('appRouter', () => {
  it('answers health with a date', async () => {
    const caller = createCallerFactory(appRouter)(await createContextInner());

    const result = await caller.health();

    expect(result.status).toBe('ok');
    expect(result.time).toBeInstanceOf(Date);
  });
});
