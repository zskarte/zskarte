import _ from 'lodash';
import { AccessControlConfig, AccessControlTypes } from '../definitions';
import { UID } from '@strapi/types';
import type { Core } from '@strapi/types';
export const CreateAccessControlMiddlewareConfig = <T extends UID.ContentType>(config: AccessControlConfig<T>) => {
  return { name: 'global::accessControl', config };
};

export const AccessControlMiddlewareRoutesConfig = <T extends UID.ContentType>(
  config: AccessControlConfig<T>,
  otherConf: Core.CoreAPI.Router.RouterConfig<T> = {},
) => {
  return _.merge(
    {
      config: {
        find: {
          middlewares: [CreateAccessControlMiddlewareConfig({ ...config, check: AccessControlTypes.LIST })],
        },
        findOne: {
          middlewares: [CreateAccessControlMiddlewareConfig({ ...config, check: AccessControlTypes.BY_ID })],
        },
        create: {
          middlewares: [CreateAccessControlMiddlewareConfig({ ...config, check: AccessControlTypes.CREATE })],
        },
        update: {
          middlewares: [CreateAccessControlMiddlewareConfig({ ...config, check: AccessControlTypes.UPDATE_BY_ID })],
        },
        delete: {
          middlewares: [CreateAccessControlMiddlewareConfig({ ...config, check: AccessControlTypes.DELETE_BY_ID })],
        },
      },
    },
    otherConf,
  );
};
