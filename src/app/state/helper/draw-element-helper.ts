import { Draw } from "ol/interaction";
import { ZsMapLineDrawElement } from "../elements/line-draw-element";
import { ZsMapPolygonDrawElement } from "../elements/polygon-draw-element copy";
import { ZsMapSymbolDrawElement } from "../elements/symbol-draw-element";
import { ZsMapTextDrawElement } from "../elements/text-draw-element";
import { ZsMapDrawElementStateType } from "../interfaces";
import { StateService } from "../state.service";

export class DrawElementHelper {
  public static getDrawHandlerForType(type: ZsMapDrawElementStateType, state: StateService, layer: string): Draw {
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
    return null;
  };
}
