module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const token = ctx.request.get('Authorization')?.replace('Bearer ', '');
    if (!token) return ctx.unauthorized();
    
    try {
      const jwtService = strapi.admin.services.token;
      const decoded = jwtService.decodeJwtToken(token, {
        subject: strapi.config.get('server.adminUrl') ? 'admin' : undefined
      });
      if (decoded.isValid && decoded.payload?.id){
        const userService = strapi.admin.services.user;
        const userData = await userService.findOne(decoded.payload.id);
        strapi.log.info(`admin-auth middleware, decoded: ${JSON.stringify(decoded)}, userData: id: ${userData?.id}, firstname: ${userData?.firstname}, lastname: ${userData?.lastname}`);
        if (userData?.isActive && !userData?.blocked && userData?.roles.some((r) => r.code === 'strapi-super-admin')){
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