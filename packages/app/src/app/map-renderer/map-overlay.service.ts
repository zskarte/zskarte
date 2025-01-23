import { Injectable, Signal, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Overlay } from 'ol';
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import { combineLatest, filter, map as rxjsMap, switchMap } from 'rxjs';
import { ZsMapStateService } from '../state/state.service';
import { DrawStyle } from './draw-style';
import { MapSelectService } from './map-select.service';

@Injectable({
  providedIn: 'root',
})
export class MapOverlayService {
  private _removeButton?: Overlay;
  private _rotateButton?: Overlay;
  private _copyButton?: Overlay;
  private _drawButton?: Overlay;
  private _closeButton?: Overlay;
  private _rotateButtonOffset = [30, -30];
  private _state = inject(ZsMapStateService);

  initialize({
    map,
    view,
    buttons,
    _select,
  }: {
    map: OlMap;
    view: OlView;
    _select: MapSelectService;
    buttons: {
      delete: Signal<MatButton>;
      rotate: Signal<MatButton>;
      copy: Signal<MatButton>;
      draw: Signal<MatButton>;
      close: Signal<MatButton>;
    };
  }) {
    this._removeButton = new Overlay({
      element: buttons.delete()?._elementRef?.nativeElement,
      positioning: 'center-center',
      offset: [30, 30],
    });
    this._copyButton = new Overlay({
      element: buttons.copy()?._elementRef?.nativeElement,
      positioning: 'center-center',
      offset: [-30, 30],
    });
    this._rotateButton = new Overlay({
      element: buttons.rotate()?._elementRef?.nativeElement,
      positioning: 'center-center',
      offset: this._rotateButtonOffset,
    });

    this._drawButton = new Overlay({
      element: buttons.draw()?._elementRef?.nativeElement,
      positioning: 'center-center',
      offset: [30, 15],
    });

    this._closeButton = new Overlay({
      element: buttons.close()?._elementRef?.nativeElement,
      positioning: 'center-center',
      offset: [30, -45],
    });

    map.addOverlay(this._removeButton);
    map.addOverlay(this._rotateButton);
    map.addOverlay(this._copyButton);
    map.addOverlay(this._drawButton);
    map.addOverlay(this._closeButton);

    combineLatest([
      _select.observeVertexPoint(),
      this._state.observeSelectedElement$().pipe(
        filter(Boolean),
        // get feature each time the coordinates change
        switchMap((element) => element.observeCoordinates().pipe(rxjsMap(() => element.getOlFeature()))),
        rxjsMap((feature) => DrawStyle.getIconCoordinates(feature, view.getResolution() ?? 1)[1]),
      ),
    ]).subscribe(([vertexPoint, featurePoint]) => {
      // prioritize vertexPoint
      const coordinates = vertexPoint ?? featurePoint;
      if (Array.isArray(coordinates)) {
        this._removeButton?.setPosition(coordinates);
        this._rotateButton?.setPosition(coordinates);
        this._copyButton?.setPosition(coordinates);
      }
    });
  }

  public getRotateButtonConfig(): { overlay: Overlay | undefined; offset: number[] } {
    return { overlay: this._rotateButton, offset: this._rotateButtonOffset };
  }

  toggleEditButtons(show: boolean, allowRotation = false) {
    this.toggleButton(show, this._removeButton?.getElement());
    this.toggleButton(allowRotation, this._rotateButton?.getElement());
    this.toggleButton(allowRotation, this._copyButton?.getElement());
  }

  toggleFlagButtons(show: boolean) {
    this.toggleButton(show, this._drawButton?.getElement());
    this.toggleButton(show, this._closeButton?.getElement());
  }

  setFlagButtonPosition(coordinates: number[]) {
    this._drawButton?.setPosition(coordinates);
    this._closeButton?.setPosition(coordinates);
  }

  toggleButton(allow: boolean, el?: HTMLElement) {
    if (el) {
      el.style.display = allow && !this._state.isReadOnly() ? 'block' : 'none';
    }
  }
}
