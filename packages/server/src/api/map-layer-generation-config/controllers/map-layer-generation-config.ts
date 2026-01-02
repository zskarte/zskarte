/**
 * map-layer-generation-config controller
 */

import { factories } from '@strapi/strapi';
import { getAndVerifyMapLayerGenerationConfig } from '../../../state/maplayer';

export default factories.createCoreController(
  'api::map-layer-generation-config.map-layer-generation-config',
  ({ strapi }) => ({
    async triggerUpdate(ctx) {
      try {
        const userData = ctx.state.adminUser;
        strapi.log.info(
          `trigger MapLayer update from admin by: id: ${userData?.id}, firstname: ${userData?.firstname}, lastname: ${userData?.lastname}`,
        );
        const config = await getAndVerifyMapLayerGenerationConfig(strapi);
        if (userData && config) {
          (async () => {
            await strapi.service('api::map-layer-generation-config.map-layer-generation-config').updateMapLayerMedias();
          })();
          return (ctx.body = { ok: true, message: 'MapLayer update triggered, see server log for details.' });
        }
        return ctx.internalServerError('Trigger MapLayer update failed.');
      } catch (error) {
        return ctx.internalServerError(`Trigger MapLayer update failed:\n${error}`);
      }
    },
  }),
);
