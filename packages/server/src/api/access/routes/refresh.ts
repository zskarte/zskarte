import { CreateAccessControlMiddlewareConfig } from '../../../middlewares/AccessControlMiddlewareConfig';
import { AccessControlTypes } from '../../../definitions';

export default {
  routes: [
    {
      method: 'GET',
      path: '/accesses/auth/refresh',
      handler: 'access.refresh',
      config: {
        //no real accessControl needed as no query parameter used inside => AccessControlType.NO_CHECK
        middlewares: [CreateAccessControlMiddlewareConfig({ type: 'api::access.access', check: AccessControlTypes.NO_CHECK })],
      },
    },
  ],
};
