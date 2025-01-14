/**
 * wms-source router
 */

import { factories } from '@strapi/strapi';
import { AccessControlMiddlewareRoutesConfig } from '../../../middlewares/AccessControlMiddlewareConfig';

export default factories.createCoreRouter('api::wms-source.wms-source', AccessControlMiddlewareRoutesConfig({type: 'api::wms-source.wms-source'}));
