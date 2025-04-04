/**
 * access controller
 */

import { factories } from '@strapi/strapi';
import utils from '@strapi/utils';
import _ from 'lodash';
import { Access, AccessTypes, Operation, User } from '../../../definitions';
import crypto from 'crypto';
import { AccessTokenTypes } from '../../../definitions/constants/AccessTokenType';
const { sanitize } = utils;

const MINUTES_15 = 1000 * 60 * 15;

const sanitizeUser = (user, ctx) => {
  //return sanitize.contentAPI.output(user, strapi.getModel('plugin::users-permissions.user'), { auth }) as Promise<User>;
  // there is no ctx.state.auth available in this context (in strapi.requestContext.get();)
  // remove private fields by hand...
  delete user.password;
  delete user.resetPasswordToken;
  delete user.confirmationToken;
  return user;
};

export default factories.createCoreController('api::access.access', ({ strapi }) => ({
  async refresh(ctx) {
    const { user } = ctx.state;
    const { id } = user;

    const { jwt } = strapi.plugins['users-permissions'].services;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { exp, iat, ...origToken } = await jwt.getToken(ctx);
    const token = jwt.issue({ ...origToken, id });

    ctx.send({
      jwt: token,
      user: await sanitizeUser(user, ctx),
    });
  },
  async token(ctx) {
    const { accessToken } = ctx.request.body;
    if (!accessToken) return ctx.badRequest('No access token provided');

    const { jwt } = strapi.plugins['users-permissions'].services;

    const accesses = (await strapi.documents('api::access.access').findMany({
      filters: { accessToken },
      populate: {
        operation: { fields: ['documentId'] },
        organization: { fields: ['documentId'] },
      },
      limit: 1,
    })) as Access[];
    const access = _.first(accesses);

    if (!access) return ctx.unauthorized('Invalid access token');
    if (!access.active) return ctx.unauthorized('Access is not active anymore');
    if (access.expiresOn && new Date(access.expiresOn).getTime() < Date.now())
      return ctx.unauthorized('Access is not active anymore');
    if (!access.operation) return ctx.unauthorized('Access has no operation assigned');
    if (!access.organization) return ctx.unauthorized('Access has no organization assigned');

    const accessUsers = (await strapi.documents('plugin::users-permissions.user').findMany({
      filters: { username: `operation_${access.type}` },
      limit: 1,
    })) as User[];
    const accessUser = _.first(accessUsers);

    if (!accessUser) return ctx.unauthorized(`Couldn't find the default access user for type ${access.type}`);

    const token = jwt.issue({
      id: accessUser.id,
      operationId: access.operation.documentId,
      organizationId: access.organization.documentId,
      permission: access.type,
    });

    //delete if it's a short time access token only
    if (accessToken.length < 32) {
      await strapi.documents('api::access.access').delete({
        documentId: access.documentId,
      });
    }

    ctx.send({
      jwt: token,
      user: await sanitizeUser(accessUser, ctx),
    });
  },
  async generate(ctx) {
    const organization = ctx.state?.user?.organization || {};
    if (!organization.documentId) return ctx.forbidden('This action is forbidden, invalid context.');
    const { name, type, operationId, tokenType } = ctx.request.body;

    if (!type) return ctx.badRequest('You must define the "type" property');
    if (!Object.values(AccessTypes).includes(type))
      return ctx.badRequest('The "type" property has an invalid value. Allowed values are: [read, write, all]');

    if (!operationId) return ctx.badRequest('You must define the "operationId" property');
    const operations = (await strapi.documents('api::operation.operation').findMany({
      filters: {
        documentId: operationId,
        organization: {
          documentId: { $eq: organization.documentId },
        },
      },
      limit: 1,
    })) as Operation[];
    if (!operations.length)
      return ctx.badRequest(
        'The operation you provided does not exist or the operation does not match your account organization!',
      );
    const operation = _.first(operations);

    const accessToken =
      tokenType === AccessTokenTypes.LONG ?
        crypto.randomBytes(16).toString('hex')
      : crypto.randomInt(999999).toString().padStart(6, '0');

    const expiresOn = tokenType === AccessTokenTypes.LONG ? null : new Date(Date.now() + MINUTES_15);

    await strapi.documents('api::access.access').create({
      data: {
        active: true,
        name,
        type,
        accessToken,
        operation,
        expiresOn,
        organization,
      },
    });

    ctx.send({ accessToken });
  },
  async find(ctx) {
    if (ctx.query.operationId) {
      ctx.query.filters = {
        operation: {
          documentId: ctx.query.operationId,
        },
      };
    }
    return await super.find(ctx);
  },
}));
