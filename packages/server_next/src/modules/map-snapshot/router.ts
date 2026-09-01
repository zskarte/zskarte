import { z } from 'zod';
import { paginationInput } from '../../lib/pagination.js';
import { operationProcedure, orgProcedure, requirePermission } from '../../trpc/procedures.js';
import { router } from '../../trpc/trpc.js';
import { MAP_SNAPSHOT_FIELDS } from './repository.js';
import { getMapSnapshotById, listMapSnapshots } from './service.js';

/** `fields[0]=createdAt&fields[1]=changesetIds` of `sidebar-history.component.ts` keeps `mapState` off the wire. */
const fieldsInput = z.array(z.enum(MAP_SNAPSHOT_FIELDS)).optional();

export const mapSnapshotRouter = router({
  list: operationProcedure
    .use(requirePermission('mapSnapshot.list'))
    .input(paginationInput.extend({ fields: fieldsInput }))
    .query(({ ctx, input }) => listMapSnapshots(ctx, input)),

  byId: orgProcedure
    .use(requirePermission('mapSnapshot.byId'))
    .input(z.object({ documentId: z.string().uuid() }))
    .query(({ ctx, input }) => getMapSnapshotById(ctx, input.documentId)),
});
