/**
 *  organization controller
 */

import { factories } from '@strapi/strapi';
import _ from 'lodash';

export default factories.createCoreController('api::organization.organization', ({ strapi }) => ({
  async forLogin(ctx) {
    await this.validateQuery(ctx);
    const { results } = await strapi.service('api::organization.organization').find({
      fields: ['name'],
      populate: {
        users: {
          fields: ['username', 'email'],
        },
        logo: {},
      },
      pagination: { limit: -1 },
      sort: ['name'],
    });

    const sanitizedResults = await this.sanitizeOutput(results, ctx);
    return this.transformResponse(sanitizedResults);
  },
  async updateLayerSettings(ctx) {
    const { id } = ctx.params;
    await this.validateQuery(ctx);
    //const sanitizedQuery = await this.sanitizeQuery(ctx);
    const data = ctx.request.body?.data;
    if (!_.isObject(data)) {
      ctx.status = 400;
      return { message: 'Missing "data" payload in the request body' };
    }

    const sanitizedInputData = (await this.sanitizeInput(data, ctx)) as object;
    //only allow to insert id's, on read/return of the data only id's are returned
    //perhaps check for valid(own/public) id's here anyway?
    const filteredInputData: { wms_sources?: number[]; map_layer_favorites?: number[] } = {};
    if ('wms_sources' in sanitizedInputData) {
      const wms_sources = sanitizedInputData.wms_sources;
      if (wms_sources && Array.isArray(wms_sources)) {
        filteredInputData.wms_sources = wms_sources.filter((s) => Number.isFinite(s));
      }
    }
    if ('map_layer_favorites' in sanitizedInputData) {
      const map_layer_favorites = sanitizedInputData.map_layer_favorites;
      if (map_layer_favorites && Array.isArray(map_layer_favorites)) {
        filteredInputData.map_layer_favorites = map_layer_favorites.filter((s) => Number.isFinite(s));
      }
    }
    await strapi.service('api::organization.organization').update(id, {
      data: filteredInputData,
    });
    ctx.status = 200;
    return { success: true };
  },
}));
