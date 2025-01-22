import { ZsMapBaseLayer } from './base-layer';
import { ZsMapDrawElementStateType } from '@zskarte/types';
import { ZsMapStateService } from '../../state/state.service';

export class ZsMapDrawLayer extends ZsMapBaseLayer {
  constructor(
    protected override _id: string,
    protected override _state: ZsMapStateService,
  ) {
    super(_id, _state);
  }

  /**
   * Draw on the layer. 
   * @returns false if drawing is not possible
   */
  draw(type: ZsMapDrawElementStateType, options: { symbolId?: number; text?: string }): boolean {
    if (!this._state.canAddElements()) {
      return false;
    }
    this._state.cancelDrawing();
    this._state.drawElement({ type, layer: this._id, ...options });
    return true;
  }
}
