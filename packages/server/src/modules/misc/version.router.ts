import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { publicProcedure } from '../../trpc/procedures.js';
import { router } from '../../trpc/trpc.js';

/**
 * The package version is read from disk instead of imported, so that the same code works
 * from `src/` (tsx) and from `dist/` (tsc emits only `src/**`, a relative json import would
 * escape rootDir and not be copied).
 */
const resolveBackendVersion = (): string => {
  let directory = dirname(fileURLToPath(import.meta.url));

  for (let depth = 0; depth < 6; depth += 1) {
    try {
      const manifest = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8')) as { version?: string };
      if (manifest.version) return manifest.version;
    } catch {
      // no readable package.json on this level, keep walking up
    }
    const parent = dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }

  return process.env['npm_package_version'] || 'unknown';
};

/** resolved once at module load, exactly like the `packageJson` import of the strapi controller */
export const backendVersion = resolveBackendVersion();

/** only the major component decides compatibility, ported 1:1 from `api/version/controllers/version.ts` */
const isCompatible = (frontend: string, backend: string): boolean => frontend.split('.')[0] === backend.split('.')[0];

export const versionRouter = router({
  get: publicProcedure.query(() => ({
    success: true,
    backendVersion,
  })),

  compatibility: publicProcedure.input(z.object({ version: z.string().min(1) })).query(({ input }) => ({
    success: true,
    backendVersion,
    frontendVersion: input.version,
    isCompatible: isCompatible(input.version, backendVersion),
  })),
});
