/**
 * `accessControl` middleware
 */

import { Core, UID } from '@strapi/strapi';
import { Operation, Organization, AccessControlConfig, AccessControlTypes, OperationPhases } from '../definitions';
import type { HasOperationType, HasOrganizationType, AccessCheckableType } from '../definitions/TypeGuards';
import {
  isOperation,
  isOrganization,
  hasOperation,
  hasOrganization,
  isAccessCheckable,
  hasPublic,
} from '../definitions/TypeGuards';

export default <T extends UID.ContentType>(config: AccessControlConfig<T>, { strapi }: { strapi: Core.Strapi }) => {
  const logAccessViolation = (ctx, message: string, userOrganisationId, jwtOperationId) => {
    strapi.log.warn(
      `[global::accessControl]: ${message}, url:${ctx.request.url}, userOrganisationId:${userOrganisationId}, jwtOperationId:${jwtOperationId}, ip:${ctx.request.ip}, user-agent:${ctx.request.headers['user-agent']}`,
    );
  };
  const doCreateChecks = async (ctx, next, userOrganisationId, jwtOperationId, jwtOrganizationId) => {
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
    if (ctx.request.body.data?.documentId !== undefined) {
      //submitting / forcing entry documentId not allowed
      logAccessViolation(
        ctx,
        `create with forcing entry documentId, ctx.request.body.data?.documentId:${JSON.stringify(ctx.request.body.data?.documentId)}`,
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
            populate: {
              organization: { fields: ['documentId' as any, 'id'] },
            },
          });
        } catch (err) {
          strapi.log.error(err);
        }
        if (!operation || operation.organization?.documentId !== userOrganisationId) {
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
      if (jwtOrganizationId) {
        if (!ctx.request.body.data?.organization || ctx.request.body.data?.organization !== jwtOrganizationId) {
          logAccessViolation(
            ctx,
            `create with other/no organization, ctx.request.body.data?.organization:${JSON.stringify(ctx.request.body.data?.organization)}`,
            jwtOrganizationId,
            jwtOperationId,
          );
          return ctx.forbidden('This action is forbidden.');
        }
      } else {
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
    }
    return next();
  };

  const addPhaseFilter = (phaseFilter, filterContext) => {
    if (phaseFilter === 'all') {
      //no filter needed
    } else if (phaseFilter === OperationPhases.ARCHIVED) {
      filterContext.phase = { $eq: OperationPhases.ARCHIVED };
    } else {
      //active or not set
      filterContext.phase = { $eq: OperationPhases.ACTIVE };
    }
  };

  const doListChecks = (ctx, next, userOrganisationId, jwtOperationId, jwtOrganizationId) => {
    //add filter to make sure only elements that are allowed are returned.
    const phaseFilter = ctx.query?.phase;
    const operationIdFilter = ctx.query?.operationId;
    if (hasOperation(config.type)) {
      if (jwtOperationId) {
        if (hasPublic(config.type)) {
          ctx.query.filters = {
            $or: [{ operation: { documentId: { $eq: jwtOperationId } } }, { public: { $eq: true } }],
          };
        } else {
          ctx.query.filters = { operation: { documentId: { $eq: jwtOperationId } } };
        }
        /*
        //only needed if there are access tokens allow full access to organization not specific operation only
      } else if (jwtOrganizationId) {
        if (hasPublic(config.type)) {
          ctx.query.filters = {
            $or: [
              { operation: { organization: { documentId: { $eq: jwtOrganizationId } } } },
              { public: { $eq: true } },
            ],
          };
        } else {
          ctx.query.filters = { operation: { organization: { documentId: { $eq: jwtOrganizationId } } } };
        }
        */
      } else {
        if (hasPublic(config.type)) {
          ctx.query.filters = {
            $or: [
              { operation: { organization: { documentId: { $eq: userOrganisationId } } } },
              { public: { $eq: true } },
            ],
          };
        } else {
          ctx.query.filters = { operation: { organization: { documentId: { $eq: userOrganisationId } } } };
        }
        if (operationIdFilter) {
          ctx.query.filters.operation.documentId = { $eq: operationIdFilter };
        }
      }
      addPhaseFilter(phaseFilter, ctx.query.filters.operation);
      return next();
    } else if (hasOrganization(config.type)) {
      if (isOperation(config.type)) {
        if (jwtOperationId) {
          ctx.query.filters = { documentId: { $eq: jwtOperationId } };
        } else {
          /*
          //only needed if there are access tokens allow full access to organization not specific operation only
          if (jwtOrganizationId) {
            ctx.query.filters = { organization: { documentId: { $eq: jwtOrganizationId } } };
          } else {
          */
            ctx.query.filters = { organization: { documentId: { $eq: userOrganisationId } } };
          //}
          if (operationIdFilter) {
            ctx.query.filters.documentId = { $eq: operationIdFilter };
          }
        }
        addPhaseFilter(phaseFilter, ctx.query.filters);
      } else {
        if (hasPublic(config.type)) {
          if (jwtOrganizationId) {
            //no operation context so jwtOrganizationId check needed here
            ctx.query.filters = {
              $or: [{ organization: { documentId: { $eq: jwtOrganizationId } } }, { public: { $eq: true } }],
            };
          } else if (userOrganisationId) {
            ctx.query.filters = {
              $or: [{ organization: { documentId: { $eq: userOrganisationId } } }, { public: { $eq: true } }],
            };
          } else {
            ctx.query.filters = { public: { $eq: true } };
          } 
        } else if (jwtOrganizationId) {
          //no operation context so jwtOrganizationId check needed here
          ctx.query.filters = { organization: { documentId: { $eq: jwtOrganizationId } } };
        } else {
          ctx.query.filters = { organization: { documentId: { $eq: userOrganisationId } } };
        }
      }
      return next();
    } else if (isOrganization(config.type)) {
      if (jwtOrganizationId) {
        //no operation context so jwtOrganizationId check needed here
        ctx.query.filters = { documentId: { $eq: jwtOrganizationId } };
      } else {
        ctx.query.filters = { documentId: { $eq: userOrganisationId } };
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
    if (canNotUseBodyValue(ctx.request.body.data?.documentId, entryId)) {
      logAccessViolation(
        ctx,
        `update to other id, ctx.request.body.documentId:${JSON.stringify(ctx.request.body.data?.documentId)}, entry:${JSON.stringify(entry)}, paramId:${paramId}, headerOperationId:${headerOperationId}`,
        userOrganisationId,
        jwtOperationId,
      );
      return ctx.forbidden('This action is forbidden.');
    }
    if (hasOperation(config.type) && canNotUseBodyValue(ctx.request.body.data?.operation, operation?.documentId)) {
      logAccessViolation(
        ctx,
        `update to other operation, ctx.request.body.operation:${JSON.stringify(ctx.request.body.data?.operation)}, entry:${JSON.stringify(entry)}, paramId:${paramId}, headerOperationId:${headerOperationId}`,
        userOrganisationId,
        jwtOperationId,
      );
      return ctx.forbidden('This action is forbidden.');
    }
    if (
      hasOrganization(config.type) &&
      canNotUseBodyValue(ctx.request.body.data?.organization, organization?.documentId)
    ) {
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

  const getOperation = async (contentType: HasOperationType, entryId: string) => {
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
        const entry = (await strapi.documents(contentType as any).findOne({
          documentId: entryId,
          fields: ['documentId'],
          populate: {
            operation: { fields: ['documentId', 'phase'], populate: { organization: { fields: ['documentId'] } } },
          },
        })) as { id: number; operation: Operation };
        return entry;
      }
    }
    return null;
  };
  const getOrganization = async (contentType: HasOrganizationType, entryId: string) => {
    if (entryId) {
      if (hasPublic(contentType)) {
        const entry = (await strapi.documents(contentType as any).findOne({
          documentId: entryId,
          fields: ['documentId', 'public'],
          populate: { organization: { fields: ['documentId'] } },
        })) as unknown as { id: number; public: boolean; organization: Organization };
        return entry;
      } else if (isOperation(contentType)) {
        const entry = (await strapi.documents(contentType).findOne({
          documentId: entryId,
          fields: ['documentId', 'phase'],
          populate: { organization: { fields: ['documentId'] } as any },
        })) as { id: number; phase: string; organization: Organization };
        return entry;
      } else {
        const entry = (await strapi.documents(contentType as any).findOne({
          documentId: entryId,
          fields: ['documentId'],
          populate: { organization: { fields: ['documentId'] } },
        })) as { id: number; organization: Organization };
        return entry;
      }
    }
    return null;
  };

  const getEntry = async (contentType: AccessCheckableType, entryId: string) => {
    let entry = null;
    let operation: Operation = null;
    let organization: Organization = null;
    if (hasOperation(contentType)) {
      entry = await getOperation(contentType, entryId);
      operation = entry?.operation;
    } else if (hasOrganization(contentType)) {
      entry = await getOrganization(contentType, entryId);
      if (isOperation(config.type)) {
        operation = entry as Operation;
      } else {
        organization = entry?.organization;
      }
    } else if (isOrganization(config.type)) {
      entry = organization = (await strapi.documents(contentType as any).findOne({
        documentId: entryId,
        fields: ['documentId'],
      })) as Organization;
    }
    if (operation) {
      organization = operation.organization;
    }
    return { entry, operation, organization };
  };

  const doByIdChecks = async (ctx, next, userOrganisationId, jwtOperationId, jwtOrganizationId) => {
    //load desired object and check if loggedin user has right to use it, before call real controller function.
    const handler: string = ctx.state?.route?.handler;
    if (!isAccessCheckable(config.type)) {
      strapi.log.error(`[global::accessControl] unknown context, handler: ${handler}, url: ${ctx.request.url}`);
      return ctx.forbidden('This action is forbidden, unknown context.');
    }
    const paramId = ctx.params?.id;
    const headerOperationId = ctx.request.headers?.operationid;
    const entryId = isOperation(config.type) ? (paramId ?? headerOperationId) : paramId;
    if (!entryId) {
      return ctx.forbidden('This action is forbidden.');
    }
    const { entry, operation, organization } = await getEntry(config.type, entryId);

    //prevent update archived operations
    if (
      isOperation(config.type) &&
      operation?.phase !== OperationPhases.ACTIVE &&
      !(handler.endsWith('.unarchive') || handler.endsWith('.shadowDelete')) &&
      !handler.endsWith('.findOne')
    ) {
      return ctx.forbidden('The operation is archived, no update allowed.');
    }

    //check if object access is allowed
    if (jwtOperationId && operation && jwtOperationId === operation.documentId) {
      //share link login accessing valid operation
    } else if (userOrganisationId && organization && jwtOrganizationId === organization.documentId) {
      //share link login accessing valid organization
    } else if (userOrganisationId && organization && userOrganisationId === organization.documentId) {
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

    const { documentId: userOrganisationId } = ctx.state?.user?.organization ?? {};
    const { jwt } = strapi.plugins['users-permissions'].services;
    const { operationId: jwtOperationId, organizationId: jwtOrganizationId } = (await jwt.getToken(ctx)) ?? {};
    if (!userOrganisationId && !jwtOperationId /*&& !jwtOrganizationId*/) {
      if (hasPublic(config.type)) {
        if (config.check === AccessControlTypes.LIST) {
          return doListChecks(ctx, next, userOrganisationId, jwtOperationId, jwtOrganizationId);
        } else if (config.check === AccessControlTypes.BY_ID) {
          return doByIdChecks(ctx, next, userOrganisationId, jwtOperationId, jwtOrganizationId);
        }
      }
      return ctx.unauthorized('This action is unauthorized.');
    }
    if (jwtOperationId && config.notForShare) {
      logAccessViolation(ctx, 'access not allowed, notForShare endpoint', userOrganisationId, jwtOperationId);
      return ctx.forbidden('This action is forbidden.');
    }

    if (config.check === AccessControlTypes.CREATE) {
      return doCreateChecks(ctx, next, userOrganisationId, jwtOperationId, jwtOrganizationId);
    } else if (config.check === AccessControlTypes.LIST) {
      return doListChecks(ctx, next, userOrganisationId, jwtOperationId, jwtOrganizationId);
    } else if (
      config.check === AccessControlTypes.BY_ID ||
      config.check === AccessControlTypes.UPDATE_BY_ID ||
      config.check === AccessControlTypes.DELETE_BY_ID
    ) {
      return doByIdChecks(ctx, next, userOrganisationId, jwtOperationId, jwtOrganizationId);
    } else {
      const handler: string = ctx.state?.route?.handler;
      strapi.log.error(
        `[global::accessControl]: config.check value missing for handler: ${handler}, url: ${ctx.request.url}`,
      );
      return ctx.forbidden('This action is forbidden, unknown mode.');
    }
  };
};
