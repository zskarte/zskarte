import { CreateAccessControlMiddlewareConfig } from '../../../middlewares/AccessControlMiddlewareConfig';
import { AccessControlTypes } from '../../../definitions';

export default {
  routes: [
    {
      method: 'GET',
      path: '/signing-key/bykey/:id',
      handler: 'signing-key.byKey',
      config: {
        middlewares: [
          //keys can be accessed without authentication, so no check needed
          CreateAccessControlMiddlewareConfig({ type: 'api::signing-key.signing-key', check: AccessControlTypes.NO_CHECK }),
        ],
      },
    },
  ],
};
