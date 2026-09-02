import * as mapLayerGenerationService from '../map-layer-generation/service.js';
import * as repository from '../map-layer-generation/repository.js';

export const getConfig = (db: Parameters<typeof repository.getConfig>[0]) => repository.initOrGetConfig(db);

export const updateConfig = (
  db: Parameters<typeof repository.getConfig>[0],
  values: Parameters<typeof repository.updateSingleConfig>[1],
) => repository.updateSingleConfig(db, values);

export const trigger = async (db: Parameters<typeof repository.getConfig>[0]) => {
  if (mapLayerGenerationService.isGenerationRunning()) {
    throw new Error('Map layer generation is already running.');
  }

  void mapLayerGenerationService
    .updateMapLayerMedias(db)
    .catch((error) => console.error('Map layer generation failed', error));

  return { success: true } as const;
};
