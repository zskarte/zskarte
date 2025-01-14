import { Strapi } from '@strapi/strapi';
import { Access } from '../definitions';

export const deleteExpiredAccessTokens = async (strapi: Strapi) => {
  try {
    const expiredAccesses = (await strapi.entityService.findMany('api::access.access', {
      filters: { expiresOn: {$lt:Date.now()} },
      limit: -1,
    })) as Access[];
    for (const expiredAccess of expiredAccesses) {
      await strapi.entityService.delete('api::access.access', expiredAccess.id);
      strapi.log.info(`Expired Access token got deleted: ${expiredAccess.accessToken}`);
    }
  } catch (error) {
    strapi.log.error(error);
  }
};
