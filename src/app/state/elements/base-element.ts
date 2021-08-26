import { Feature } from 'ol';
import { Observable } from 'rxjs';
import { IZsMapBaseElementState } from '../interfaces';
import OlMap from 'ol/Map';
import { StateService } from '../state.service';

export abstract class ZsMapBaseElement<T = IZsMapBaseElementState> {
  protected _element: Observable<T>;
  protected _olFeature: Feature = new Feature();
  constructor(protected _id: string, protected _state: StateService) {}

  public getOlFeature(): Feature {
    return this._olFeature;
  };

  public getId(): string {
    return this._id;
  }
}
