/**
 * map-layer controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::map-layer.map-layer', () => ({
  async find(ctx) {
    ctx.query.populate = {'organization': {'fields':['id']}, 'wms_source': {'fields':['id']}};
    return await super.find(ctx);
  },
  async findOne(ctx) {
    ctx.query.populate = {'organization': {'fields':['id']}, 'wms_source': {'fields':['id']}};
    return await super.findOne(ctx);
  },
}));
