import { Draw } from 'ol/interaction';
import { ZsMapBaseDrawElement } from '../elements/base-draw-element';
import { ZsMapBaseElement } from '../elements/base-element';
import { ZsMapLineDrawElement } from '../elements/line-draw-element';
import { ZsMapPolygonDrawElement } from '../elements/polygon-draw-element copy';
import { ZsMapSymbolDrawElement } from '../elements/symbol-draw-element';
import { ZsMapTextDrawElement } from '../elements/text-draw-element';
import { ZsMapDrawElementStateType } from '../interfaces';
import { StateService } from '../state.service';

export class DrawElementHelper {
  public static createDrawHandlerForType(
    type: ZsMapDrawElementStateType,
    state: StateService,
    layer: string
  ): Draw {
    switch (type) {
      case ZsMapDrawElementStateType.TEXT:
        return ZsMapTextDrawElement.getOlDrawHandler(state, layer);
      case ZsMapDrawElementStateType.POLYGON:
        return ZsMapPolygonDrawElement.getOlDrawHandler(state, layer);
      case ZsMapDrawElementStateType.LINE:
        return ZsMapLineDrawElement.getOlDrawHandler(state, layer);
      case ZsMapDrawElementStateType.SYMBOL:
        return ZsMapSymbolDrawElement.getOlDrawHandler(state, layer);
    }
    throw new Error(`Could not create draw handler for type ${type}`);
  }

  public static createInstance(id: string, state: StateService): ZsMapBaseDrawElement {
    const element = state.getDrawElementState(id);
    switch (element.type) {
      case ZsMapDrawElementStateType.TEXT:
        return new ZsMapTextDrawElement(element.id, state);
      case ZsMapDrawElementStateType.POLYGON:
        return new ZsMapPolygonDrawElement(element.id, state);
      case ZsMapDrawElementStateType.LINE:
        return new ZsMapLineDrawElement(element.id, state);
      case ZsMapDrawElementStateType.SYMBOL:
        return new ZsMapSymbolDrawElement(element.id, state);
    }
    throw new Error(`Could not create instance handler for draw element ${id}`);
  }
}
