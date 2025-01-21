/**
 * organization router.
 */

import { factories } from '@strapi/strapi';
import { AccessControlMiddlewareRoutesConfig } from '../../../middlewares/AccessControlMiddlewareConfig';

export default factories.createCoreRouter(
  'api::organization.organization',
  AccessControlMiddlewareRoutesConfig({ type: 'api::organization.organization' }),
);
