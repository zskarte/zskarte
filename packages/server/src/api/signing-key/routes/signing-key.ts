/**
 * signing-key router
 */

import { factories } from '@strapi/strapi';
import { AccessControlMiddlewareRoutesConfig } from '../../../middlewares/AccessControlMiddlewareConfig';

export default factories.createCoreRouter(
  'api::signing-key.signing-key',
  AccessControlMiddlewareRoutesConfig({ type: 'api::signing-key.signing-key' }),
);
