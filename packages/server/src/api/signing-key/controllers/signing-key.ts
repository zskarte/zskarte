/**
 * signing-key controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::signing-key.signing-key', ({ strapi }) => ({
  async byKey(ctx) {
    const { id } = ctx.params;
    const result = await strapi.documents('api::signing-key.signing-key').findFirst({
      filters: {
        keyId: { $eq: id },
      },
    });

    const sanitizedResult = await this.sanitizeOutput(result, ctx);
    return this.transformResponse(sanitizedResult);
  },
}));
