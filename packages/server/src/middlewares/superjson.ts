import { Core } from '@strapi/strapi';
import { Context } from 'koa';

declare const __webpack_require__: any;

let superjson: any;
if (typeof __webpack_require__ === 'function') {
  superjson = require('superjson');
} else {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  superjson = require('fix-esm').require('superjson') as typeof import('superjson');
}

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

export default (_index, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: Context, next) => {
    // Ignore non api requests
    if (!ctx.url.startsWith('/api/')) return await next();
    await next();
    try {
      if (!ctx.response.body || typeof ctx.response.body !== 'object') {
        strapi.log.warn('Response body is not an object, skipping superjson serialization');
        return;
      }
      let body = transformDates(ctx.response.body);
      body = superjson.serialize(body);
      ctx.response.body = body;
    } catch (e) {
      strapi.log.error(e);
    }
  };
};
