/**
 * access router
 */

import { factories } from '@strapi/strapi';
import { AccessControlMiddlewareRoutesConfig } from '../../../middlewares/AccessControlMiddlewareConfig';

export default factories.createCoreRouter('api::access.access', AccessControlMiddlewareRoutesConfig({type: 'api::access.access', notForShare: true}));
