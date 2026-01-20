import { CreateAccessControlMiddlewareConfig } from '../../../middlewares/AccessControlMiddlewareConfig';
import { AccessControlTypes } from '../../../definitions';

export default {
  routes: [
    {
      method: 'POST',
      path: '/map-layer-generation-configs/trigger-update',
      handler: 'map-layer-generation-config.triggerUpdate',
      config: {
        middlewares: [
          'global::admin-auth',
          //no real accessControl needed as no query parameter used inside => AccessControlType.NO_CHECK
          CreateAccessControlMiddlewareConfig({type: 'api::map-layer-generation-config.map-layer-generation-config',check: AccessControlTypes.NO_CHECK})
        ],
        //bypass normal content-api auth
        auth: false    
      },
    },
  ],
};
