import { CreateAccessControlMiddlewareConfig } from '../../../middlewares/AccessControlMiddlewareConfig';
import { AccessControlTypes } from '../../../definitions';

export default {
  routes: [
    {
      method: 'PUT',
      path: '/organizations/:id/layer-settings',
      handler: 'organization.updateLayerSettings',
      config: {
        middlewares: [
          CreateAccessControlMiddlewareConfig({ type: 'api::organization.organization', check: AccessControlTypes.UPDATE_BY_ID }),
        ],
      },
    },
  ],
};
