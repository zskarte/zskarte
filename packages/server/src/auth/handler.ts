import { fromNodeHeaders } from 'better-auth/node';
import type { FastifyPluginAsync } from 'fastify';
import { auth } from './auth.js';

export const authHandlerPlugin: FastifyPluginAsync = async (app) => {
  app.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    async handler(request: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) {
      const url = new URL(request.url, `${request.protocol}://${request.host}`);
      const authRequest = new Request(url, {
        method: request.method,
        headers: fromNodeHeaders(request.headers),
        ...(request.body === undefined ? {} : { body: JSON.stringify(request.body) }),
      });
      const response = await auth.handler(authRequest);

      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      return reply.send(response.body ? await response.text() : null);
    },
  });
};
