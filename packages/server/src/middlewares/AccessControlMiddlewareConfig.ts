import _ from 'lodash';
import { AccessControlConfig, AccessControlTypes } from '../definitions';
import { Common } from '@strapi/strapi';
import type { CoreApi } from '@strapi/types';
export const CreateAccessControlMiddlewareConfig = <T extends Common.UID.ContentType>(config: AccessControlConfig<T>) => {
  return { name: 'global::accessControl', config };
};

export const AccessControlMiddlewareRoutesConfig = <T extends Common.UID.ContentType>(
  config: AccessControlConfig<T>,
  otherConf: CoreApi.Router.RouterConfig<T> = {},
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
