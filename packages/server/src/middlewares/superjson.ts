import { Strapi } from '@strapi/strapi';
import { Context } from 'koa';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export const superjson = require('fix-esm').require('superjson') as typeof import('superjson');

export default (_index, { strapi }: { strapi: Strapi }) => {
  return async (ctx: Context, next) => {
    await next();
    if (ctx.response.body && typeof ctx.response.body === 'object') {
      const body = superjson.serialize(ctx.response.body);
      ctx.response.body = body;
    }
  };
};
