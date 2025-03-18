/**
 * journal-entry controller
 */

import { factories } from '@strapi/strapi';
import { updateJournal } from '../../../state/journal';
import { errors } from '@strapi/utils';
import fp from 'lodash/fp';

export default factories.createCoreController('api::journal-entry.journal-entry', ({ strapi }) => ({
  async byNumber(ctx) {
    await this.validateQuery(ctx);
    ctx.query.filters['messageNumber'] = ctx.params.number;
    //operation and organization filter is added by accessControl
    const entry = await strapi.documents('api::journal-entry.journal-entry').findFirst(ctx.query);
    const sanitizedResults = await this.sanitizeOutput(entry, ctx);
    return this.transformResponse(sanitizedResults);
  },
  async create(ctx) {
    const { identifier }: { identifier: string } = ctx.request.headers as any;
    if (!identifier) {
      ctx.status = 400;
      return { message: 'Missing headers: identifier' };
    }

    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);
    const { body = {} } = ctx.request;
    if (!fp.isObject(body.data)) {
      throw new errors.ValidationError('Missing "data" payload in the request body');
    }
    await this.validateInput(body.data, ctx);
    const sanitizedInputData = (await this.sanitizeInput(body.data, ctx)) as any;

    //insert journal entry
    const entity = await strapi.documents('api::journal-entry.journal-entry').create({
      ...sanitizedQuery,
      data: sanitizedInputData,
    });

    const sanitizedEntity = (await this.sanitizeOutput(entity, ctx)) as any;
    updateJournal(identifier, sanitizedInputData.operation, sanitizedEntity);
    ctx.status = 201;
    return this.transformResponse(sanitizedEntity);
  },
  async update(ctx) {
    const { identifier }: { identifier: string } = ctx.request.headers as any;
    if (!identifier) {
      ctx.status = 400;
      return { message: 'Missing headers: identifier' };
    }
    const { id } = ctx.params;
    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);
    const { body = {} } = ctx.request;
    if (!fp.isObject(body.data)) {
      throw new errors.ValidationError('Missing "data" payload in the request body');
    }
    await this.validateInput(body.data, ctx);
    const sanitizedInputData = (await this.sanitizeInput(body.data, ctx)) as any;

    const documentId = id;
    //fetch operationId
    const entry = await strapi.documents('api::journal-entry.journal-entry').findOne({
      documentId,
      populate: { operation: { fields: ['documentId' as any] } },
    });
    const operationId = entry.operation.documentId;

    //update journal entry
    const entity = await strapi.documents('api::journal-entry.journal-entry').update({
      documentId,
      ...sanitizedQuery,
      data: sanitizedInputData,
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    updateJournal(identifier, operationId, { ...sanitizedInputData, documentId });
    return this.transformResponse(sanitizedEntity);
  },
}));
