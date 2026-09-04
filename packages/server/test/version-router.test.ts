import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { backendVersion, versionRouter } from '../src/modules/misc/version.router.js';
import { createContextInner } from '../src/trpc/context.js';
import { createCallerFactory } from '../src/trpc/trpc.js';

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };
const packageVersion = manifest.version;

const major = Number(backendVersion.split('.')[0]);

const createCaller = async () => createCallerFactory(versionRouter)(await createContextInner({}));

describe('version.get', () => {
  it('returns the version of the server package', async () => {
    const caller = await createCaller();

    await expect(caller.get()).resolves.toEqual({ success: true, backendVersion: packageVersion });
  });
});

describe('version.compatibility', () => {
  it('is compatible for the same major version', async () => {
    const caller = await createCaller();

    await expect(caller.compatibility({ version: `${major}.0.0` })).resolves.toEqual({
      success: true,
      backendVersion,
      frontendVersion: `${major}.0.0`,
      isCompatible: true,
    });
  });

  it('is compatible for a differing minor and patch version', async () => {
    const caller = await createCaller();

    const result = await caller.compatibility({ version: `${major}.99.123` });

    expect(result.isCompatible).toBe(true);
  });

  it('is incompatible across a major version bump', async () => {
    const caller = await createCaller();

    await expect(caller.compatibility({ version: `${major + 1}.0.0` })).resolves.toMatchObject({
      frontendVersion: `${major + 1}.0.0`,
      isCompatible: false,
    });
  });

  it('rejects an empty version like the strapi 400 did', async () => {
    const caller = await createCaller();

    await expect(caller.compatibility({ version: '' })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});
