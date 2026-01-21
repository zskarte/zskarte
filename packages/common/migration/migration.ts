import type { IZsMapStateV1, IZsMapStateV2, IZsMapStateV3, ZsMapState, ZsMapStateAllVersions } from '@zskarte/types';
import { ZsMapLayerStateType } from '@zskarte/types';
import { cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

export const zsMapStateMigration = (mapState: ZsMapStateAllVersions | undefined): ZsMapState | undefined => {
  if (!mapState) {
    return;
  }

  switch (mapState.version) {
    case undefined:
    // @ts-ignore TS7029: Intentional fallthrough to handle next migration
    // biome-ignore lint/suspicious/noFallthroughSwitchClause: it's intentioned to handle next conversion also
    case 1: {
      const oldMapState = cloneDeep(mapState) as IZsMapStateV1;
      const newMapState = cloneDeep(mapState) as IZsMapStateV2;

      newMapState.version = 2;
      newMapState.layers = oldMapState.layers
        ? oldMapState.layers.reduce((acc, layer) => {
            if (!layer.id) {
              layer.id = uuidv4();
            }
            acc[layer.id] = layer;
            return acc;
          }, {})
        : {};
      newMapState.drawElements = oldMapState.drawElements
        ? oldMapState.drawElements.reduce((acc, element) => {
            if (!element.id) {
              element.id = uuidv4();
            }
            acc[element.id] = element;
            return acc;
          }, {})
        : {};

      mapState = newMapState;
      // Fallthrough intentional
    }
    // @ts-ignore TS7029: Intentional fallthrough to handle next migration
    // biome-ignore lint/suspicious/noFallthroughSwitchClause: it's intentioned to handle next conversion also
    case 2: {
      // const oldMapState = cloneDeep(mapState) as IZsMapStateV2;
      const newMapState = cloneDeep(mapState) as IZsMapStateV3;

      newMapState.version = 3;
      if (!newMapState.changesetIds) {
        newMapState.changesetIds = ['0'];
      }
      if (!newMapState.drawElementChangesetIds) {
        newMapState.drawElementChangesetIds = {};
      }
      //old layer generation had different id for object key and id field (the key is used on references)
      Object.entries(newMapState.layers).forEach(([id, layer]) => (layer.id = id));

      //add initial changesetId
      if (newMapState.drawElements) {
        Object.keys(newMapState.drawElements).forEach((id) => {
          const drawElementChangesetIds = newMapState.drawElementChangesetIds[id];
          if (!drawElementChangesetIds || drawElementChangesetIds.length === 0) {
            newMapState.drawElementChangesetIds[id] = ['0'];
          }
        });
      }
      mapState = newMapState;
      // Fallthrough intentional
    }
    default: {
      const convertedMapState = mapState as IZsMapStateV3;
      //make sure all object/list are initialized
      if (!convertedMapState.drawElements) {
        convertedMapState.drawElements = {};
      }
      if (!convertedMapState.drawElementChangesetIds) {
        convertedMapState.drawElementChangesetIds = {};
      }
      if (!convertedMapState.changesetIds) {
        convertedMapState.changesetIds = [];
      }
      //prevent problems if there is no layer
      if (!convertedMapState.layers || Object.values(convertedMapState.layers).length === 0) {
        let layerId = Object.values(convertedMapState.drawElements).find((e) => e.layer)?.layer;
        if (!layerId) {
          layerId = uuidv4();
        }
        convertedMapState.layers = { [layerId]: { id: layerId, type: ZsMapLayerStateType.DRAW, name: 'Layer 1' } };
      }

      return convertedMapState;
    }
  }
};
