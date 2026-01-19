import jwt from 'jsonwebtoken';

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    let token = ctx.cookies.get('jwtToken');
    if (!token) return ctx.unauthorized();

    try {
      const jwtSecret = strapi.config.get('admin.auth.secret') || strapi.config.get('plugin.admin.auth.secret');
      let decoded = jwt.verify(token, jwtSecret, {
        subject: strapi.config.get('server.adminUrl') ? 'admin' : undefined,
      });
      if (typeof decoded === 'object' && decoded.userId) {
        const userService = strapi.admin.services.user;
        const userData = await userService.findOne(decoded.userId);
        strapi.log.info(
          `admin-auth middleware, decoded: ${JSON.stringify(decoded)}, userData: id: ${userData?.id}, firstname: ${userData?.firstname}, lastname: ${userData?.lastname}`,
        );
        if (userData?.isActive && !userData?.blocked && userData?.roles.some((r) => r.code === 'strapi-super-admin')) {
          ctx.state.adminUser = userData;
          return next();
        }
      }
    } catch (err) {
      strapi.log.error('Admin JWT invalid:', err);
    }
    return ctx.unauthorized('Invalid admin token');
  };
};
