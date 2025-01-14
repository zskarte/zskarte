import { CreateAccessControlMiddlewareConfig } from '../../../middlewares/AccessControlMiddlewareConfig';
import { AccessControlTypes } from '../../../definitions';

export default {
  routes: [
    {
      method: 'POST',
      path: '/accesses/auth/token',
      handler: 'access.token',
      config: {
        //no real accessControl needed as no query parameter used inside => AccessControlType.NO_CHECK
        middlewares: [CreateAccessControlMiddlewareConfig({ type: 'api::access.access', check: AccessControlTypes.NO_CHECK })],
      },
    },
    {
      method: 'POST',
      path: '/accesses/auth/token/generate',
      handler: 'access.generate',
      config: {
        //no accessControl handling needed as it's verified inside controller directly => AccessControlType.NO_CHECK
        middlewares: [CreateAccessControlMiddlewareConfig({ type: 'api::access.access', check: AccessControlTypes.NO_CHECK })],
      },
    },
  ],
};
