import { Core } from '@strapi/strapi';
import { Access } from '../definitions';

export const deleteExpiredAccessTokens = async (strapi: Core.Strapi) => {
  try {
    const expiredAccesses = (await strapi.documents('api::access.access').findMany({
      filters: { expiresOn: { $lt: Date.now() } },
      limit: -1,
    })) as Access[];
    for (const expiredAccess of expiredAccesses) {
      await strapi.documents('api::access.access').delete({
        documentId: expiredAccess.documentId,
      });
      strapi.log.info(`Expired Access token got deleted: ${expiredAccess.accessToken}`);
    }
  } catch (error) {
    strapi.log.error(error);
  }
};
