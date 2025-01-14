/**
 * wms-source controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::wms-source.wms-source', () => ({
  async find(ctx) {
    ctx.query.populate = {'organization': {'fields':['id']}};
    return await super.find(ctx);
  },
  async findOne(ctx) {
    ctx.query.populate = {'organization': {'fields':['id']}};
    return await super.findOne(ctx);
  },
}));
