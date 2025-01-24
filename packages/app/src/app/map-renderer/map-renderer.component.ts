import { AsyncPipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  viewChild,
} from '@angular/core';
import { MatButton, MatButtonModule, MatMiniFabButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Sign, ZsMapDrawElementStateType } from '@zskarte/types';
import { firstValueFrom } from 'rxjs';
import { GuestLimitDialogComponent } from '../guest-limit-dialog/guest-limit-dialog.component';
import { removeCoordinates } from '../helper/coordinates';
import { I18NService } from '../state/i18n.service';
import { ZsMapStateService } from '../state/state.service';
import { ZsMapOLFeatureProps } from './elements/base/ol-feature-props';
import { MapOverlayService } from './map-overlay.service';
import { MapRendererService } from './map-renderer.service';
import { MapSelectService } from './map-select.service';

@Component({
  selector: 'app-map-renderer',
  templateUrl: './map-renderer.component.html',
  styleUrls: ['./map-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, MatIcon, MatMiniFabButton, MatButtonModule],
})
export class MapRendererComponent implements AfterViewInit {
  public i18n = inject(I18NService);
  private _state = inject(ZsMapStateService);
  private _dialog = inject(MatDialog);
  private _select = inject(MapSelectService);
  private _overlay = inject(MapOverlayService);
  public renderer = inject(MapRendererService);

  readonly mapElement = viewChild.required<ElementRef>('mapElement');
  readonly deleteElement = viewChild.required<MatButton>('delete');
  readonly rotateElement = viewChild.required<MatButton>('rotate');
  readonly copyElement = viewChild.required<MatButton>('copy');
  readonly drawElement = viewChild.required<MatButton>('draw');
  readonly closeElement = viewChild.required<MatButton>('close');

  public isDevicePositionFlagVisible = false;

  private _rotating = false;
  private _initialRotation = 0;

  public ngAfterViewInit(): void {
    this.renderer.initialize({
      mapElement: this.mapElement,
      buttons: {
        delete: this.deleteElement,
        rotate: this.rotateElement,
        copy: this.copyElement,
        draw: this.drawElement,
        close: this.closeElement,
      },
    });
  }

  async startRotating() {
    const feature = this._select.getFeature();
    if (!feature?.get('sig')) {
      return;
    }
    this._rotating = true;
    this._initialRotation = feature.get('sig').rotation;
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  @HostListener('document:touchcancel')
  stopRotating() {
    this._rotating = false;
  }

  @HostListener('document:mousemove', ['$event'])
  async onMouseMove(event: MouseEvent | TouchEvent) {
    if (!this._rotating) {
      return;
    }

    if (window.TouchEvent && event instanceof TouchEvent && event.targetTouches.length <= 0) {
      return;
    }

    event.preventDefault();

    const feature = this._select.getFeature();

    if (!feature?.get('sig')) {
      return;
    }

    let pageX = 0,
      pageY = 0;
    if (window.TouchEvent && event instanceof TouchEvent) {
      pageX = event.targetTouches[event.targetTouches.length - 1].pageX;
      pageY = event.targetTouches[event.targetTouches.length - 1].pageY;
    } else if (event instanceof MouseEvent) {
      pageX = event.pageX;
      pageY = event.pageY;
    }

    const rotateButtonConfig = this._overlay.getRotateButtonConfig();

    const rect = rotateButtonConfig?.overlay?.getElement()?.getBoundingClientRect() ?? { x: 0, y: 0 };

    const radians = Math.atan2(
      pageX - (rect.x - rotateButtonConfig.offset[0]),
      pageY - (rect.y - rotateButtonConfig.offset[1]),
    );
    const degrees = Math.round(radians * (180 / Math.PI) * -1 + 100);
    let rotation = degrees + this._initialRotation;

    // keep the rotation between -180 and 180
    rotation = rotation > 180 ? rotation - 360 : rotation;
    const id = feature?.get(ZsMapOLFeatureProps.DRAW_ELEMENT_ID);

    // Update the signature in the UI separately from the state, to provide a smooth rotation
    feature.get('sig').rotation = rotation;
    feature.changed();

    // Update the state with the new rotation (debounced)
    this.renderer.getCachedDrawElement(id)?.element.updateElementState((draft) => {
      draft.rotation = rotation;
    });
  }

  async removeFeature() {
    const state = this._state.getDrawElementState(this._select.getFeature()?.get(ZsMapOLFeatureProps.DRAW_ELEMENT_ID));
    const coordinates = this._select.getVertexPoint();

    if (state?.id && coordinates) {
      const newCoordinates = removeCoordinates(state.coordinates, coordinates);

      let remove = false;
      switch (state.type) {
        case ZsMapDrawElementStateType.POLYGON:
        case ZsMapDrawElementStateType.SYMBOL:
          if (newCoordinates.length < 1) {
            remove = true;
          } else {
            let maxSub = 0;
            for (const subCoordinates of newCoordinates as number[][]) {
              if (maxSub <= subCoordinates.length) {
                maxSub = subCoordinates.length;
              }
            }
            if (maxSub < 4) {
              remove = true;
            }
          }
          break;
        case ZsMapDrawElementStateType.LINE:
          if (newCoordinates.length < 3) {
            remove = true;
          }
          break;
      }

      if (remove) {
        this._state.removeDrawElement(state.id);
      } else {
        this._state.updateDrawElementState(state.id, 'coordinates', newCoordinates as any);
      }
    }

    this._overlay.toggleEditButtons(false);
  }

  async copySign() {
    const feature = this._select.getFeature();
    if (!feature) {
      return;
    }
    this._overlay.toggleEditButtons(false);
    const sign = feature?.get('sig') as Sign;
    if (!sign || !sign.id) {
      return;
    }
    const layer = await firstValueFrom(this._state.observeActiveLayer());
    this._state.copySymbol(sign.id, layer?.getId());
    this._state.resetSelectedFeature();
  }

  toggleDrawingDialog() {
    if (!this._state.canAddElements()) {
      this._dialog.open(GuestLimitDialogComponent);
      return;
    }

    const posFlag = this._state.getCurrentPositionFlag();
    const coordinates = posFlag.coordinates;
    if (coordinates) {
      this._state.drawSignatureAtCoordinate(coordinates);
      this._overlay.toggleFlagButtons(false);
    }
  }

  hidePositionFlag() {
    this._state.updatePositionFlag({ isVisible: false, coordinates: [0, 0] });
    this._overlay.toggleFlagButtons(false);
  }
}
