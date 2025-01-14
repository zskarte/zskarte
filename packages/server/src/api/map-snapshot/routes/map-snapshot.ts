/**
 * map-snapshot router
 */

import { factories } from '@strapi/strapi';
import { AccessControlMiddlewareRoutesConfig } from '../../../middlewares/AccessControlMiddlewareConfig';

export default factories.createCoreRouter('api::map-snapshot.map-snapshot', AccessControlMiddlewareRoutesConfig({type: 'api::map-snapshot.map-snapshot'}));
