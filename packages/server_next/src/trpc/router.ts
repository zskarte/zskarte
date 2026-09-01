import { mapLayerRouter } from '../modules/map-layer/router.js';
import { mapSnapshotRouter } from '../modules/map-snapshot/router.js';
import { proxyRouter } from '../modules/misc/proxy.router.js';
import { versionRouter } from '../modules/misc/version.router.js';
import { organizationRouter } from '../modules/organization/router.js';
import { signingKeyRouter } from '../modules/signing-key/router.js';
import { wmsSourceRouter } from '../modules/wms-source/router.js';
import { publicProcedure, router } from './trpc.js';

/**
 * Root router. Feature routers get merged in here as the modules land.
 */
export const appRouter = router({
  organization: organizationRouter,
  mapLayer: mapLayerRouter,
  wmsSource: wmsSourceRouter,
  // the `mapSnapshot.byId` cache header in `server.ts` depends on this mount point
  mapSnapshot: mapSnapshotRouter,
  signingKey: signingKeyRouter,
  version: versionRouter,
  proxy: proxyRouter,
  health: publicProcedure.query(() => ({ status: 'ok' as const, time: new Date() })),
});

export type AppRouter = typeof appRouter;
