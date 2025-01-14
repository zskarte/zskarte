import { Strapi } from '@strapi/strapi';
import axios from 'axios';

export default ({ strapi }: { strapi: Strapi }) => ({
  proxy: async (ctx: any) => {
    try {
      const { url } = ctx.request.query;
      if (!url) return ctx.badRequest('Missing url query parameter');
      const { data } = await axios.get(url);
      ctx.send(data);
    } catch (error) {
      strapi.log.error(error);
      return ctx.badRequest(error.message);
    }
  },
});
