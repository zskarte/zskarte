/**
 * journal-entry controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::journal-entry.journal-entry', ({ strapi }) => ({
  async byNumber(ctx) {
    await this.validateQuery(ctx);
    ctx.query.filters['messageNumber'] = ctx.params.number;
    //operation and organization filter is added by accessControl
    const entry = await strapi.documents('api::journal-entry.journal-entry').findFirst(ctx.query);
    const sanitizedResults = await this.sanitizeOutput(entry, ctx);
    return this.transformResponse(sanitizedResults);
  },
}));