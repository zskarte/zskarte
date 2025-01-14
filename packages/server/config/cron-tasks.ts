import { deleteExpiredAccessTokens } from '../src/state/access';
import { archiveOperations, createMapStateSnapshots, deleteGuestOperations, persistMapStates } from '../src/state/operation';
import { Strapi } from '@strapi/strapi';

export default {
  // Every hour
  '0 * * * *': async ({ strapi }: { strapi: Strapi }) => await archiveOperations(strapi),
  // Every fifteen seconds
  '*/15 * * * * *': async ({ strapi }: { strapi: Strapi }) => await persistMapStates(strapi),
  // Every midnight delete the guest operations
  '0 0 * * *': async ({ strapi }: { strapi: Strapi }) => await deleteGuestOperations(strapi),
  // Every hour delete expired access tokens
  '* * * * * *': async ({ strapi }: { strapi: Strapi }) => await deleteExpiredAccessTokens(strapi),
  // Every 5 minutes
  '*/5 * * * *': ({ strapi }: { strapi: Strapi }) => createMapStateSnapshots(strapi),
};
