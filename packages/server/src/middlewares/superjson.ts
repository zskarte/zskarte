import { Strapi } from '@strapi/strapi';
import { Context } from 'koa';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export const superjson = require('fix-esm').require('superjson') as typeof import('superjson');

function replaceDateValues(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(replaceDateValues);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      if (obj[key] && typeof obj[key] === 'object') {
        acc[key] = replaceDateValues(obj[key]);
      } else {
        const keyLower = key.toLowerCase();
        if (['date', 'createdat', 'updatedat', 'timestamp'].some((k) => keyLower.includes(k))) {
          acc[key] = new Date(obj[key]);
        } else {
          acc[key] = obj[key];
        }
      }
      return acc;
    }, {} as any);
  }
  return obj;
}

export default (_index, { strapi }: { strapi: Strapi }) => {
  return async (ctx: Context, next) => {
    await next();
    if (ctx.response.body && typeof ctx.response.body === 'object') {
      let body = replaceDateValues(ctx.response.body);
      body = superjson.serialize(body);
      ctx.response.body = body;
    }
  };
};
