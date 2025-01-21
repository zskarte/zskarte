/*


switzerchees: WILL BE DELETED/REFACTORED into types or common package shortly

*/
import { cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

export const zsMapStateMigration = (mapState: any): any => {
  if (!mapState) {
    return;
  }

  // TODO implement migration over multiple versions
  switch (mapState.version) {
    case undefined:
    case 1: {
      const oldMapState = cloneDeep(mapState);
      const newMapState = cloneDeep(mapState);

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
            if (!element) return acc;
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
      return mapState;
  }
};
