import { IZsMapStateV1, IZsMapStateV2, ZsMapState, ZsMapStateAllVersions } from '@zskarte/types';
import { cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

export const migrateMapState = (mapState: ZsMapStateAllVersions | undefined): ZsMapState | undefined => {
  if (!mapState) {
    return mapState;
  }

  switch (mapState.version) {
    case undefined:
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

      return newMapState;
    }
    default:
      return mapState as IZsMapStateV2;
  }
};
