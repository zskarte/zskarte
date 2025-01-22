import { Strapi } from '@strapi/strapi';
import { Context } from 'koa';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export const superjson = require('fix-esm').require('superjson') as typeof import('superjson');

const transformDates = (data) => {
  if (!data || typeof data !== 'object') return data;

  for (const key in data) {
    if (typeof data[key] === 'string' && data[key].match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) {
      data[key] = new Date(data[key]);
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      transformDates(data[key]);
    }
  }
  return data;
};

export default (_index, { strapi }: { strapi: Strapi }) => {
  return async (ctx: Context, next) => {
    await next();
    if (ctx.response.body && typeof ctx.response.body === 'object') {
      let body = transformDates(ctx.response.body);
      body = superjson.serialize(body);
      ctx.response.body = body;
    }
  };
};
