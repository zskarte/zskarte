/**
 * map-layer-generation-config router
 */

import { factories } from '@strapi/strapi';
import { AccessControlMiddlewareRoutesConfig } from '../../../middlewares/AccessControlMiddlewareConfig';

export default factories.createCoreRouter(
  'api::map-layer-generation-config.map-layer-generation-config',
  AccessControlMiddlewareRoutesConfig({ type: 'api::map-layer-generation-config.map-layer-generation-config' }),
);
