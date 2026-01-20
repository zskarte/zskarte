/**
 * map-layer controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::map-layer.map-layer', () => ({
  async find(ctx) {
    ctx.query.populate = { organization: { fields: ['documentId'] }, wms_source: { fields: ['documentId'] }, media_source: { fields: ['id','documentId','url','name'] } };
    return await super.find(ctx);
  },
  async findOne(ctx) {
    ctx.query.populate = { organization: { fields: ['documentId'] }, wms_source: { fields: ['documentId'] }, media_source: { fields: ['id','documentId','url','name'] } };
    return await super.findOne(ctx);
  },
}));
