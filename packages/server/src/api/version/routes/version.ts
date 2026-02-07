import { CreateAccessControlMiddlewareConfig } from '../../../middlewares/AccessControlMiddlewareConfig';
import { AccessControlTypes } from '../../../definitions';

export default {
  routes: [
    {
      method: 'GET',
      path: '/version/compatibility',
      handler: 'version.compatibility',
      config: {
        //no real accessControl needed as no DB data accessed => AccessControlType.NO_CHECK
        middlewares: [CreateAccessControlMiddlewareConfig({ type: null, check: AccessControlTypes.NO_CHECK })],
      },
    },
    {
      method: 'GET',
      path: '/version',
      handler: 'version.get',
      config: {
        //no real accessControl needed as no DB data accessed => AccessControlType.NO_CHECK
        middlewares: [CreateAccessControlMiddlewareConfig({ type: null, check: AccessControlTypes.NO_CHECK })],
      },
    },
  ],
};
