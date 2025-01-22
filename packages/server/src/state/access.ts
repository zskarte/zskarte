import { Strapi } from '@strapi/strapi';
import { Access } from '../definitions';

export const deleteExpiredAccessTokens = async (strapi: Strapi) => {
  try {
    const expiredAccesses = (await strapi.documents('api::access.access').findMany({
      filters: { expiresOn: { $lt: Date.now() } },
      limit: -1,
    })) as Access[];
    for (const expiredAccess of expiredAccesses) {
      await strapi.documents('api::access.access').delete({
        documentId: expiredAccess.id,
      });
      strapi.log.info(`Expired Access token got deleted: ${expiredAccess.accessToken}`);
    }
  } catch (error) {
    strapi.log.error(error);
  }
};
