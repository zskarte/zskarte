import { deleteExpiredAccessTokens } from '../src/state/access';
import {
  archiveOperations,
  createMapStateSnapshots,
  deleteGuestOperations,
  persistMapStates,
} from '../src/state/operation';
import { Core } from '@strapi/strapi';

export default {
  // Every hour
  '0 * * * *': async ({ strapi }: { strapi: Core.Strapi }) => {
    await archiveOperations(strapi);
    await deleteExpiredAccessTokens(strapi);
  },
  // Every fifteen seconds
  '*/15 * * * * *': async ({ strapi }: { strapi: Core.Strapi }) => await persistMapStates(strapi),
  // Every midnight delete the guest operations
  '0 0 * * *': async ({ strapi }: { strapi: Core.Strapi }) => await deleteGuestOperations(strapi),
  // Every 5 minutes
  '*/5 * * * *': async ({ strapi }: { strapi: Core.Strapi }) => await createMapStateSnapshots(strapi),
};
