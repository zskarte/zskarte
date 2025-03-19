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

    const { db } = strapi;
    return await db.transaction(async () => {
      async function countOcurrence(messageNumber: number) {
        return await strapi.documents('api::journal-entry.journal-entry').count({
          filters: {
            messageNumber: messageNumber,
            operation: { documentId: { $eq: sanitizedInputData.operation } },
            organization: { documentId: { $eq: sanitizedInputData.organization } },
          },
        });
      }
      async function earliestOcurrenceId(messageNumber: number) {
        return (
          await strapi.documents('api::journal-entry.journal-entry').findFirst({
            filters: {
              messageNumber: messageNumber,
              operation: { documentId: { $eq: sanitizedInputData.operation } },
              organization: { documentId: { $eq: sanitizedInputData.organization } },
            },
            sort: { createdAt: 'asc' },
            fields: ['documentId' as any],
          })
        ).documentId;
      }

      const messageNumber = sanitizedInputData.messageNumber;
      let nextMessageNumber = null;
      if (messageNumber) {
        //if messageNumber is submitted and already exist return error
        if ((await countOcurrence(messageNumber)) > 0) {
          ctx.status = 409;
          return { message: `messageNumber ${messageNumber} already exist` };
        }
      } else {
        //if not submitted find highest number and add 1
        const entry = await strapi.documents('api::journal-entry.journal-entry').findFirst({
          filters: {
            operation: { documentId: { $eq: sanitizedInputData.operation } },
            organization: { documentId: { $eq: sanitizedInputData.organization } },
          },
          sort: { messageNumber: 'desc' },
          fields: ['messageNumber'],
        });

        nextMessageNumber = (entry?.messageNumber || 0) + 1;
        sanitizedInputData.messageNumber = nextMessageNumber;
      }

      //insert journal entry
      const entity = await strapi.documents('api::journal-entry.journal-entry').create({
        ...sanitizedQuery,
        data: sanitizedInputData,
      });
      const sanitizedEntity = (await this.sanitizeOutput(entity, ctx)) as any;

      //check if just inserted entry have a unique messageNumber (e.g. race condition)
      if ((await countOcurrence(sanitizedEntity.messageNumber)) > 1) {
        const keepDocumentId = await earliestOcurrenceId(sanitizedEntity.messageNumber);
        //check if this is not the earlier one
        if (sanitizedEntity.documentId !== keepDocumentId) {
          if (nextMessageNumber === null) {
            //if not unique and number was submitted: throw error, which will rollback the transaction
            throw new errors.ValidationError(`messageNumber ${messageNumber} already exist`);
          }
          //if automatic number: update entry as long as needed to make the number unique
          while (
            (await countOcurrence(sanitizedEntity.messageNumber)) > 1 &&
            (await earliestOcurrenceId(sanitizedEntity.messageNumber)) !== sanitizedEntity.documentId
          ) {
            sanitizedEntity.messageNumber += 1;
            await strapi.documents('api::journal-entry.journal-entry').update({
              documentId: sanitizedEntity.documentId,
              data: {
                messageNumber: sanitizedEntity.messageNumber,
              },
            });
          }
        }
      }
      updateJournal(identifier, sanitizedInputData.operation, sanitizedEntity);
      ctx.status = 201;
      return this.transformResponse(sanitizedEntity);
    });
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
    //fetch infos of current entry
    const entry = await strapi.documents('api::journal-entry.journal-entry').findOne({
      documentId,
      fields: ['messageNumber'],
      populate: {
        operation: { fields: ['documentId' as any] },
        organization: { fields: ['documentId' as any] },
      },
    });
    const operationId = entry.operation.documentId;
    const organizationId = entry.organization.documentId;

    if ('messageNumber' in sanitizedInputData) {
      //if messageNumber is submitted on update, make sure it's unique: used by itself or nowhere
      const usage = await strapi.documents('api::journal-entry.journal-entry').findMany({
        filters: {
          messageNumber: sanitizedInputData.messageNumber,
          operation: { documentId: { $eq: operationId } },
          organization: { documentId: { $eq: organizationId } },
        },
        fields: ['documentId' as any],
      });
      if ((usage.length === 1 && usage[0].documentId !== documentId) || usage.length > 1) {
        ctx.status = 409;
        return { message: `messageNumber ${sanitizedInputData.messageNumber} already exist` };
      }
    }

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
