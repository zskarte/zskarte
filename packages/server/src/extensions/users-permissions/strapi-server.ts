import _ from 'lodash';
import { Organization } from '../../definitions';

export default (plugin) => {
  const me = plugin.controllers.user.me;
  const injectOrganization = async (ctx) => {
    //populate organisation and logo (for normal users)
    ctx.query.populate = {
      organization: {
        populate: {
          logo: {},
          wms_sources: { fields: ['documentId'] },
          map_layer_favorites: { fields: ['documentId'] },
        },
      },
    };
    await me(ctx);
    const { jwt } = strapi.plugins['users-permissions'].services;
    const { operationId } = await jwt.getToken(ctx);
    if (operationId) {
      //if it's a share token login, populate corresponding organization
      const organizations = (await strapi.documents('api::organization.organization').findMany({
        filters: {
          operations: {
            documentId: { $eq: operationId },
          },
        },
        populate: {
          logo: {},
          wms_sources: true,
          map_layer_favorites: true,
        },
        limit: 1,
      })) as unknown as Organization[];
      const organization = _.first(organizations);
      ctx.body.organization = organization;
    }
    if (ctx.body.organization) {
      //want to return wms-source/map-layer id's only, strapi cannot do that (v14.7) therefore the population with fields, and here map the results to an id array
      ctx.body.organization.wms_sources = ctx.body.organization.wms_sources?.map((x) => x.id);
      ctx.body.organization.map_layer_favorites = ctx.body.organization.map_layer_favorites?.map((x) => x.id);
    }
  };
  plugin.controllers.user.me = injectOrganization;

  const userServiceFunc = plugin.services.user;
  const fetchAuthenticatedUserWithOrganization = (id) => {
    //this is used for load user into ctx.state.user (https://github.com/strapi/strapi/blob/main/packages/plugins/users-permissions/server/strategies/users-permissions.js#L24)
    //changed: also populate organisation
    return strapi
      .query('plugin::users-permissions.user')
      .findOne({ where: { id }, populate: ['role', 'organization'] });
  };

  //plugin.services.user is anonymous function not an object
  //to persist the override, set it in the response of the function call
  plugin.services.user = (initParamObj) => {
    const userService = userServiceFunc(initParamObj);
    userService.fetchAuthenticatedUser = fetchAuthenticatedUserWithOrganization;
    return userService;
  };

  return plugin;
};
