/**
 * map-snapshot controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::map-snapshot.map-snapshot', () => ({
  async findOne(ctx) {
    //enable frontend caching as they never change
    const result = await super.findOne(ctx);
    // Set the Cache-Control header to cache responses for 1 day
    ctx.res.setHeader('Cache-Control', 'max-age=86400');
    return result
  },
}));
