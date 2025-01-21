/**
 * journal-entry router
 */

import { factories } from '@strapi/strapi';
import { AccessControlMiddlewareRoutesConfig } from '../../../middlewares/AccessControlMiddlewareConfig';

export default factories.createCoreRouter(
  'api::journal-entry.journal-entry',
  AccessControlMiddlewareRoutesConfig({ type: 'api::journal-entry.journal-entry' }),
);
