/**
 *  operation controller
 */

import { factories } from '@strapi/strapi';
import { Operation, PatchExtended, OperationStates } from '../../../definitions';
import { operationCaches, updateCurrentLocation, updateMapState } from '../../../state/operation';
import _ from 'lodash';

const allowedMetaFields = ['name', 'description', 'eventStates'];

export default factories.createCoreController('api::operation.operation', ({ strapi }) => ({
  async findOne(ctx) {
    const { id } = ctx.params;
    await this.validateQuery(ctx);
    const sanitizedQuery = await this.sanitizeQuery(ctx);
    const entity = await strapi.service('api::operation.operation').findOne(id, sanitizedQuery);
    const sanitizedEntity = (await this.sanitizeOutput(entity, ctx)) as Operation;
    const operationCache = operationCaches[entity.id];
    if (operationCache) {
      sanitizedEntity.mapState = operationCache.mapState;
    }
    return this.transformResponse(sanitizedEntity);
  },
  async patch(ctx) {
    const { identifier, operationid } = ctx.request.headers;
    if (!identifier || !operationid) {
      ctx.status = 400;
      return { message: 'Missing headers: identifier or operationId' };
    }
    const patches: PatchExtended[] = ctx.request.body;
    await updateMapState(operationid, identifier, patches);
    ctx.status = 200;
    return { success: true };
  },
  async currentLocation(ctx) {
    const { identifier, operationid } = ctx.request.headers;
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
    ctx.query.fields = ['name', 'description', 'status', 'eventStates', 'updatedAt'];
    ctx.query.sort = 'updatedAt:DESC';
    if (ctx.query.pagination) {
      ctx.query.pagination.limit = -1;
    } else {
      ctx.query.pagination = { limit: -1 };
    }
    return await this.find(ctx, undefined);
  },
  async archive(ctx) {
    const { id } = ctx.params;
    await strapi.entityService.update('api::operation.operation', id, {
      data: {
        status: OperationStates.ARCHIVED,
      },
    });
    ctx.status = 200;
    return { success: true };
  },
  async shadowDelete(ctx) {
    const { id } = ctx.params;
    await strapi.entityService.update('api::operation.operation', id, {
      data: {
        status: OperationStates.DELETED,
      },
    });
    ctx.status = 200;
    return { success: true };
  },
  async unarchive(ctx) {
    const { id } = ctx.params;
    await strapi.entityService.update('api::operation.operation', id, {
      data: {
        status: OperationStates.ACTIVE,
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
