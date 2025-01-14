'use strict';

/**
 * operation router.
 */

import { factories } from '@strapi/strapi';
import { AccessControlMiddlewareRoutesConfig } from '../../../middlewares/AccessControlMiddlewareConfig';

export default factories.createCoreRouter('api::operation.operation', AccessControlMiddlewareRoutesConfig({type: 'api::operation.operation'}));
