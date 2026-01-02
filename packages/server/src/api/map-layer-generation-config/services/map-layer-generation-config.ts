/**
 * map-layer-generation-config service
 */

import { factories } from '@strapi/strapi';
import { updateMapLayerMedias } from '../../../state/maplayer';

export default factories.createCoreService(
  'api::map-layer-generation-config.map-layer-generation-config',
  ({ strapi }) => ({
    async updateMapLayerMedias() {
      return await updateMapLayerMedias(strapi);
    },
  }),
);
