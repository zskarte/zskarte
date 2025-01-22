/**
 * `accessControl` middleware
 */

import { Strapi, Common } from '@strapi/strapi';
import { Operation, Organization, AccessControlConfig, AccessControlTypes, OperationStates } from '../definitions';
import type { HasOperationType, HasOrganizationType, AccessCheckableType } from '../definitions/TypeGuards';
import {
  isOperation,
  isOrganization,
  hasOperation,
  hasOrganization,
  isAccessCheckable,
  hasPublic,
} from '../definitions/TypeGuards';

export default <T extends Common.UID.ContentType>(config: AccessControlConfig<T>, { strapi }: { strapi: Strapi }) => {
  const logAccessViolation = (ctx, message: string, userOrganisationId, jwtOperationId) => {
    strapi.log.warn(
      `[global::accessControl]: ${message}, url:${ctx.request.url}, userOrganisationId:${userOrganisationId}, jwtOperationId:${jwtOperationId}, ip:${ctx.request.ip}, user-agent:${ctx.request.headers['user-agent']}`,
    );
  };
  const doCreateChecks = async (ctx, next, userOrganisationId, jwtOperationId) => {
    //verify relations are allowed values
    if (ctx.request.body.data?.id !== undefined) {
      //submitting / forcing entry id not allowed
      logAccessViolation(
        ctx,
        `create with forcing entry id, ctx.request.body.data?.id:${JSON.stringify(ctx.request.body.data?.id)}`,
        userOrganisationId,
        jwtOperationId,
      );
      return ctx.forbidden('This action is forbidden.');
    }
    if (hasOperation(config.type)) {
      if (!ctx.request.body.data?.operation) {
        //null, undefined, 0 are all not allowed
        logAccessViolation(
          ctx,
          `create with no operation, ctx.request.body.data?.operation:${JSON.stringify(ctx.request.body.data?.operation)}`,
          userOrganisationId,
          jwtOperationId,
        );
        return ctx.forbidden('This action is forbidden.');
      }
      if (jwtOperationId) {
        if (ctx.request.body.data?.operation !== jwtOperationId) {
          logAccessViolation(
            ctx,
            `create with other operation, ctx.request.body.data?.operation:${JSON.stringify(ctx.request.body.data?.operation)}`,
            userOrganisationId,
            jwtOperationId,
          );
          return ctx.forbidden('This action is forbidden.');
        }
      } else {
        let operation = null;
        try {
          operation = await strapi.documents('api::operation.operation').findOne({
            documentId: ctx.request.body.data?.operation,
            populate: ['organization.id'],
          });
        } catch {
          //e.g. if ctx.request.body.data?.operation is an object not an id
        }
        if (!operation || operation.organization?.id !== userOrganisationId) {
          logAccessViolation(
            ctx,
            `create with other operation, ctx.request.body.data?.operation:${JSON.stringify(ctx.request.body.data?.operation)}`,
            userOrganisationId,
            jwtOperationId,
          );
          return ctx.forbidden('This action is forbidden.');
        }
      }
    }
    if (hasOrganization(config.type)) {
      if (!ctx.request.body.data?.organization || ctx.request.body.data?.organization !== userOrganisationId) {
        logAccessViolation(
          ctx,
          `create with other/no organization, ctx.request.body.data?.organization:${JSON.stringify(ctx.request.body.data?.organization)}`,
          userOrganisationId,
          jwtOperationId,
        );
        return ctx.forbidden('This action is forbidden.');
      }
    }
    return next();
  };

  const addStatusFilter = (statusFilter, filterContext) => {
    if (statusFilter === 'all') {
      //no filter needed
    } else if (statusFilter === OperationStates.ARCHIVED) {
      filterContext.status = { $eq: OperationStates.ARCHIVED };
    } else {
      //active or not set
      filterContext.status = { $eq: OperationStates.ACTIVE };
    }
  };

  const doListChecks = (ctx, next, userOrganisationId, jwtOperationId) => {
    //add filter to make sure only elements that are allowed are returned.
    const statusFilter = ctx.query?.status;
    const operationIdFilter = ctx.query?.operationId;
    if (hasOperation(config.type)) {
      if (jwtOperationId) {
        if (hasPublic(config.type)) {
          ctx.query.filters = { $or: [{ operation: { id: { $eq: jwtOperationId } } }, { public: { $eq: true } }] };
        } else {
          ctx.query.filters = { operation: { id: { $eq: jwtOperationId } } };
        }
      } else {
        if (hasPublic(config.type)) {
          ctx.query.filters = {
            $or: [{ operation: { organization: { id: { $eq: userOrganisationId } } } }, { public: { $eq: true } }],
          };
        } else {
          ctx.query.filters = { operation: { organization: { id: { $eq: userOrganisationId } } } };
        }
        if (operationIdFilter) {
          ctx.query.filters.operation.id = { $eq: operationIdFilter };
        }
      }
      addStatusFilter(statusFilter, ctx.query.filters.operation);
      return next();
    } else if (hasOrganization(config.type)) {
      if (isOperation(config.type)) {
        if (jwtOperationId) {
          ctx.query.filters = { id: { $eq: jwtOperationId } };
        } else {
          ctx.query.filters = { organization: { id: { $eq: userOrganisationId } } };
          if (operationIdFilter) {
            ctx.query.filters.id = { $eq: operationIdFilter };
          }
        }
        addStatusFilter(statusFilter, ctx.query.filters);
      } else {
        if (jwtOperationId) {
          return ctx.unauthorized('This action is unauthorized, unknown context.');
        } else {
          if (hasPublic(config.type)) {
            if (userOrganisationId) {
              ctx.query.filters = {
                $or: [{ organization: { id: { $eq: userOrganisationId } } }, { public: { $eq: true } }],
              };
            } else {
              ctx.query.filters = { public: { $eq: true } };
            }
          } else {
            ctx.query.filters = { organization: { id: { $eq: userOrganisationId } } };
          }
        }
      }
      return next();
    } else if (isOrganization(config.type)) {
      if (jwtOperationId) {
        ctx.query.filters = { operations: { id: { $eq: jwtOperationId } } };
      } else {
        ctx.query.filters = { id: { $eq: userOrganisationId } };
      }
      return next();
    } else {
      const handler: string = ctx.state?.route?.handler;
      strapi.log.error(`[global::accessControl] unknown context, handler: ${handler}, url: ${ctx.request.url}`);
      return ctx.forbidden('This action is forbidden, unknown context.');
    }
  };

  const canNotUseBodyValue = (bodyValue, idToCheck) => {
    return bodyValue === null || (bodyValue !== undefined && bodyValue !== idToCheck);
  };

  const doUpdateCheck = (
    ctx,
    next,
    userOrganisationId,
    jwtOperationId,
    entry,
    operation,
    organization,
    entryId,
    paramId,
    headerOperationId,
  ) => {
    //verify entryId/relations of data to update/save are allowed values
    if (canNotUseBodyValue(ctx.request.body.data?.id, entryId)) {
      logAccessViolation(
        ctx,
        `update to other id, ctx.request.body.id:${JSON.stringify(ctx.request.body.data?.id)}, entry:${JSON.stringify(entry)}, paramId:${paramId}, headerOperationId:${headerOperationId}`,
        userOrganisationId,
        jwtOperationId,
      );
      return ctx.forbidden('This action is forbidden.');
    }
    if (hasOperation(config.type) && canNotUseBodyValue(ctx.request.body.data?.operation, operation?.id)) {
      logAccessViolation(
        ctx,
        `update to other operation, ctx.request.body.operation:${JSON.stringify(ctx.request.body.data?.operation)}, entry:${JSON.stringify(entry)}, paramId:${paramId}, headerOperationId:${headerOperationId}`,
        userOrganisationId,
        jwtOperationId,
      );
      return ctx.forbidden('This action is forbidden.');
    }
    if (hasOrganization(config.type) && canNotUseBodyValue(ctx.request.body.data?.organization, organization?.id)) {
      logAccessViolation(
        ctx,
        `update to other organization, ctx.request.body.organization:${JSON.stringify(ctx.request.body.data?.organization)}, entry:${JSON.stringify(entry)}, paramId:${paramId}, headerOperationId:${headerOperationId}`,
        userOrganisationId,
        jwtOperationId,
      );
      return ctx.forbidden('This action is forbidden.');
    }
    return next();
  };

  const getOperation = async (contentType: HasOperationType, entryId) => {
    if (entryId) {
      if (hasPublic(contentType)) {
        /*
        //there is currently no HasOperationType that is also HasPublicType so compilation would fail
        const entry = await strapi.entityService.findOne(
          contentType,
          entryId,
          { fields:['id', 'public'], populate: {'operation': {'fields':['id'], 'populate': {'organization': {'fields':['id']}}}} }
        ) as {id: number, public: boolean, operation: Operation};
        return entry;
        */
      } else {
        const entry = (await strapi.documents(contentType).findOne({
          documentId: entryId,
          fields: ['id'],
          populate: { operation: { fields: ['id', 'status'], populate: { organization: { fields: ['id'] } } } },
        })) as { id: number; operation: Operation };
        return entry;
      }
    }
    return null;
  };
  const getOrganization = async (contentType: HasOrganizationType, entryId) => {
    if (entryId) {
      if (hasPublic(contentType)) {
        const entry = (await strapi.documents(contentType).findOne({
          documentId: entryId,
          fields: ['id', 'public'],
          populate: { organization: { fields: ['id'] } },
        })) as { id: number; public: boolean; organization: Organization };
        return entry;
      } else if (isOperation(contentType)) {
        const entry = (await strapi.documents(contentType).findOne({
          documentId: entryId,
          fields: ['id', 'status'],
          populate: { organization: { fields: ['id'] } },
        })) as { id: number; status: string; organization: Organization };
        return entry;
      } else {
        const entry = (await strapi.documents(contentType).findOne({
          documentId: entryId,
          fields: ['id'],
          populate: { organization: { fields: ['id'] } },
        })) as { id: number; organization: Organization };
        return entry;
      }
    }
    return null;
  };

  const getEntry = async (contentType: AccessCheckableType, entryId) => {
    let entry = null;
    let operation: Operation = null;
    let organization: Organization = null;
    if (hasOperation(contentType)) {
      entry = await getOperation(contentType, entryId);
      operation = entry.operation;
    } else if (hasOrganization(contentType)) {
      entry = await getOrganization(contentType, entryId);
      if (isOperation(config.type)) {
        operation = entry as Operation;
      } else {
        organization = entry.organization;
      }
    } else if (isOrganization(config.type)) {
      entry = organization = { id: entryId } as Organization;
    }
    if (operation) {
      organization = operation.organization;
    }
    return { entry, operation, organization };
  };

  const getIdIfValid = (value) => {
    if (value && /^\d+$/.test(value)) {
      return parseInt(value);
    }
    //prevent requests with invalid id's (not numbers)
    return null;
  };

  const doByIdChecks = async (ctx, next, userOrganisationId, jwtOperationId) => {
    //load desired object and check if loggedin user has right to use it, before call real controller function.
    const handler: string = ctx.state?.route?.handler;
    if (!isAccessCheckable(config.type)) {
      strapi.log.error(`[global::accessControl] unknown context, handler: ${handler}, url: ${ctx.request.url}`);
      return ctx.forbidden('This action is forbidden, unknown context.');
    }
    const paramId = getIdIfValid(ctx.params?.id);
    const headerOperationId = getIdIfValid(ctx.request.headers?.operationid);
    const entryId = isOperation(config.type) ? (paramId ?? headerOperationId) : paramId;
    if (!entryId) {
      return ctx.forbidden('This action is forbidden.');
    }
    const { entry, operation, organization } = await getEntry(config.type, entryId);

    //prevent update archived operations
    if (
      isOperation(config.type) &&
      operation?.status !== OperationStates.ACTIVE &&
      !handler.endsWith('.unarchive') &&
      !handler.endsWith('.findOne')
    ) {
      return ctx.forbidden('The operation is archived, no update allowed.');
    }

    //check if object access is allowed
    if (jwtOperationId && operation && jwtOperationId === operation.id) {
      //share link login accessing valid operation
    } else if (userOrganisationId && organization && userOrganisationId === organization.id) {
      //loggedin user is in corresponding organization
    } else if (config.check === AccessControlTypes.BY_ID && hasPublic(config.type) && entry.public === true) {
      //it's a public object, read is allowed
    } else if (!operation && !organization) {
      //entry not found
      //return ctx.notFound();
      //don't leak this information
      return ctx.forbidden('This action is forbidden.');
    } else {
      logAccessViolation(
        ctx,
        `access not allowed, entry:${JSON.stringify(entry)}, paramId:${paramId}, headerOperationId:${headerOperationId},`,
        userOrganisationId,
        jwtOperationId,
      );
      return ctx.forbidden('This action is forbidden.');
    }

    if (config.check === AccessControlTypes.UPDATE_BY_ID) {
      return doUpdateCheck(
        ctx,
        next,
        userOrganisationId,
        jwtOperationId,
        entry,
        operation,
        organization,
        entryId,
        paramId,
        headerOperationId,
      );
    }
    return next();
  };

  //effective middleware function
  return async (ctx, next) => {
    ctx.state.accessControlExecuted = true;
    if (config.check === AccessControlTypes.NO_CHECK) {
      //function is explicit marked as no filter/check needed
      return next();
    }

    const { id: userOrganisationId } = ctx.state?.user?.organization ?? {};
    const { jwt } = strapi.plugins['users-permissions'].services;
    const { operationId: jwtOperationId } = (await jwt.getToken(ctx)) ?? {};
    if (!userOrganisationId && !jwtOperationId) {
      if (hasPublic(config.type)) {
        if (config.check === AccessControlTypes.LIST) {
          return doListChecks(ctx, next, userOrganisationId, jwtOperationId);
        } else if (config.check === AccessControlTypes.BY_ID) {
          return doByIdChecks(ctx, next, userOrganisationId, jwtOperationId);
        }
      }
      return ctx.unauthorized('This action is unauthorized.');
    }
    if (jwtOperationId && config.notForShare) {
      logAccessViolation(ctx, 'access not allowed, notForShare endpoint', userOrganisationId, jwtOperationId);
      return ctx.forbidden('This action is forbidden.');
    }

    if (config.check === AccessControlTypes.CREATE) {
      return doCreateChecks(ctx, next, userOrganisationId, jwtOperationId);
    } else if (config.check === AccessControlTypes.LIST) {
      return doListChecks(ctx, next, userOrganisationId, jwtOperationId);
    } else if (
      config.check === AccessControlTypes.BY_ID ||
      config.check === AccessControlTypes.UPDATE_BY_ID ||
      config.check === AccessControlTypes.DELETE_BY_ID
    ) {
      return doByIdChecks(ctx, next, userOrganisationId, jwtOperationId);
    } else {
      const handler: string = ctx.state?.route?.handler;
      strapi.log.error(
        `[global::accessControl]: config.check value missing for handler: ${handler}, url: ${ctx.request.url}`,
      );
      return ctx.forbidden('This action is forbidden, unknown mode.');
    }
  };
};
