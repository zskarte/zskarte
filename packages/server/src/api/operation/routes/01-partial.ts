import { CreateAccessControlMiddlewareConfig } from '../../../middlewares/AccessControlMiddlewareConfig';
import { AccessControlTypes } from '../../../definitions';

//this file have an '01-' prefix to make sure it's loaded before the default one (operation), without it the /operations/:id path is used for /operations/overview path.
export default {
  routes: [
    {
      method: 'GET',
      path: '/operations/overview',
      handler: 'operation.overview',
      config: {
        middlewares: [CreateAccessControlMiddlewareConfig({ type: 'api::operation.operation', check: AccessControlTypes.LIST })],
      },
    },
    {
      method: 'PUT',
      path: '/operations/:id/archive',
      handler: 'operation.archive',
      config: {
        middlewares: [CreateAccessControlMiddlewareConfig({ type: 'api::operation.operation', check: AccessControlTypes.BY_ID })],
      },
    },
    {
      method: 'PUT',
      path: '/operations/:id/meta',
      handler: 'operation.updateMeta',
      config: {
        middlewares: [CreateAccessControlMiddlewareConfig({ type: 'api::operation.operation', check: AccessControlTypes.UPDATE_BY_ID })],
      },
    },
    {
      method: 'PUT',
      path: '/operations/:id/mapLayers',
      handler: 'operation.updateMapLayers',
      config: {
        middlewares: [CreateAccessControlMiddlewareConfig({ type: 'api::operation.operation', check: AccessControlTypes.UPDATE_BY_ID })],
      },
    },
  ],
};
