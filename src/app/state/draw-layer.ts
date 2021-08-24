import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ZsMapBaseLayer } from './base-layer';
import { ZsMapLayerState } from './interfaces';
import { StateService } from './state.service';

export class ZsMapDrawLayer extends ZsMapBaseLayer {
  constructor(protected _id: string, protected _state: StateService) {
    super(_id, _state);
  }
}
