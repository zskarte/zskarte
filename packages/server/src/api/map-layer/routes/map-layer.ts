/**
 * map-layer router
 */

import { factories } from '@strapi/strapi';
import { AccessControlMiddlewareRoutesConfig } from '../../../middlewares/AccessControlMiddlewareConfig';

export default factories.createCoreRouter(
  'api::map-layer.map-layer',
  AccessControlMiddlewareRoutesConfig({ type: 'api::map-layer.map-layer' }),
);
