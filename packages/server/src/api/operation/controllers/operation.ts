/**
 *  operation controller
 */

import { factories } from '@strapi/strapi';
import { Operation, OperationPhases } from '../../../definitions';
import { operationCaches, updateCurrentLocation, addChangeset } from '../../../state/operation';
import _ from 'lodash';
import { IZsChangeset } from '@zskarte/types';

const allowedMetaFields = ['name', 'description', 'eventStates'];

export default factories.createCoreController('api::operation.operation', ({ strapi }) => ({
  async findOne(ctx) {
    const { id } = ctx.params;
    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);
    const entity = await strapi.service('api::operation.operation').findOne(id, sanitizedQuery);
    const sanitizedEntity = (await this.sanitizeOutput(entity, ctx)) as Operation;
    const operationCache = operationCaches[entity.documentId];
    if (operationCache) {
      sanitizedEntity.mapState = operationCache.mapState;
      sanitizedEntity.changesets = operationCache.changesets;
    }
    return this.transformResponse(sanitizedEntity);
  },
  async changeset(ctx) {
    const { identifier, operationid }: { identifier: string; operationid: string } = ctx.request.headers as any;
    if (!identifier || !operationid) {
      ctx.status = 400;
      return { message: 'Missing headers: identifier or operationId' };
    }
    try {
      const changeset: IZsChangeset = ctx.request.body;
      const error = await addChangeset(operationid, identifier, changeset, ctx, () => {
        ctx.status = 429;
        ctx.body = {
          error: 'Too Many Requests',
          message: 'Lock not available within 15 seconds',
        };
      });
      if (error) {
        if (ctx.status !== 429) {
          ctx.status = 400;
          return error;
        }
      }
      if (error === false) {
        return { success: true, alreadySubmitted: true };
      }
      return { success: true };
    } catch (e: any) {
      // onTimeout already handled 429, other errors get 500
      if (ctx.status !== 429) {
        strapi.log.error(e);
        ctx.status = 500;
        ctx.body = { error: 'Internal error', message: e.message };
      }
    }
  },
  async currentLocation(ctx) {
    const { identifier, operationid }: { identifier: string; operationid: string } = ctx.request.headers as any;
    if (!identifier || !operationid) {
      ctx.status = 400;
      return { message: 'Missing headers: identifier or operationId' };
    }
    const { long, lat } = ctx.request.body;
    if (!_.isEmpty(ctx.request.body) && (typeof long !== 'number' || typeof long !== 'number')) {
      //if value submitted but not number, prevent save / populate to other user
      ctx.status = 400;
      return { message: 'invalid coordinates' };
    }
    await updateCurrentLocation(operationid, identifier, { long, lat });
    ctx.status = 200;
    return { success: true };
  },
  async overview(ctx) {
    ctx.query.fields = ['name', 'description', 'phase', 'eventStates', 'updatedAt'];
    ctx.query.sort = 'updatedAt:DESC';
    if (ctx.query.pagination && _.isObject(ctx.query.pagination)) {
      ctx.query.pagination = { ...ctx.query.pagination, limit: -1 };
    } else {
      ctx.query.pagination = { limit: -1 };
    }
    return await this.find(ctx, undefined);
  },
  async archive(ctx) {
    const { id } = ctx.params;
    await strapi.documents('api::operation.operation').update({
      documentId: id,

      data: {
        phase: OperationPhases.ARCHIVED,
      },
    });
    ctx.status = 200;
    return { success: true };
  },
  async shadowDelete(ctx) {
    const { id } = ctx.params;
    await strapi.documents('api::operation.operation').update({
      documentId: id,
      data: {
        phase: OperationPhases.DELETED,
      },
    });
    ctx.status = 200;
    return { success: true };
  },
  async unarchive(ctx) {
    const { id } = ctx.params;
    await strapi.documents('api::operation.operation').update({
      documentId: id,

      data: {
        phase: OperationPhases.ACTIVE,
      },
    });
    ctx.status = 200;
    return { success: true };
  },
  async updateMeta(ctx) {
    const { id } = ctx.params;
    await this.validateQuery(ctx);
    //const sanitizedQuery = await this.sanitizeQuery(ctx);
    const data = ctx.request.body?.data;
    if (!_.isObject(data)) {
      ctx.status = 400;
      return { message: 'Missing "data" payload in the request body' };
    }

    const sanitizedInputData = await this.sanitizeInput(data, ctx);
    //filter out not allowed fields for meta call
    const filteredInputData = {};
    Object.keys(sanitizedInputData).forEach((field) => {
      if (allowedMetaFields.includes(field)) {
        filteredInputData[field] = sanitizedInputData[field];
      }
    });

    await strapi.service('api::operation.operation').update(id, {
      //...sanitizedQuery,
      data: filteredInputData,
    });
    ctx.status = 200;
    return { success: true };
  },
  async updateMapLayers(ctx) {
    const { id } = ctx.params;
    await this.validateQuery(ctx);
    //const sanitizedQuery = await this.sanitizeQuery(ctx);
    const data = ctx.request.body?.data;
    if (!_.isObject(data)) {
      ctx.status = 400;
      return { message: 'Missing "data" payload in the request body' };
    }

    await strapi.service('api::operation.operation').update(id, {
      data: { mapLayers: data },
    });
    ctx.status = 200;
    return { success: true };
  },
}));
