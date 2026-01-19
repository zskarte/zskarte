import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ZsMapDrawElementStateType } from '@zskarte/types';
import { cloneDeep } from 'lodash';
import { Coordinate } from 'ol/coordinate';
import { Observable, firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { GuestLimitDialogComponent } from '../guest-limit-dialog/guest-limit-dialog.component';
import { ZsMapBaseDrawElement } from '../map-renderer/elements/base/base-draw-element';
import { SessionService } from '../session/session.service';
import { ZsMapStateService } from '../state/state.service';
import { IShortcut } from './shortcut.interfaces';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { I18NService } from '../state/i18n.service';
import { DrawDialogComponent } from '../draw-dialog/draw-dialog.component';
import { SearchService } from '../search/search.service';

@Injectable({
  providedIn: 'root',
})
export class ShortcutService {
  private _session = inject(SessionService);
  private _state = inject(ZsMapStateService);
  private _search = inject(SearchService);
  private _dialog = inject(MatDialog);
  public i18n = inject(I18NService);

  private _selectedElement: ZsMapBaseDrawElement | undefined = undefined;
  private _selectedFeatureId: string | undefined = undefined;
  private _copyElement: ZsMapBaseDrawElement | undefined = undefined;
  private _inputs = ['INPUT', 'TEXTAREA'];
  private _keydownObserver: Observable<KeyboardEvent>;
  private _readOnlyMode = false;

  constructor() {
    this._keydownObserver = new Observable((observer) => {
      window.addEventListener('keydown', (event) => {
        observer.next(event);
      });
    });

    this._state.observeSelectedElement$().subscribe((element) => {
      this._selectedElement = element;
    });

    this._state.observeSelectedFeature$().subscribe((featureId) => {
      this._selectedFeatureId = featureId;
    });

    this._state.observeIsReadOnly().subscribe((readOnlyMode) => {
      this._readOnlyMode = readOnlyMode;
    });
  }

  public initialize(): void {
    this._listen({ shortcut: 'mod+backspace', drawModeOnly: true }).subscribe(() => {
      if (this._selectedFeatureId) {
        const confirmation = this._dialog.open(ConfirmationDialogComponent, {
          data: this.i18n.get('removeFeatureFromMapConfirm'),
        });
        confirmation.afterClosed().subscribe((result) => {
          if (result && this._selectedFeatureId) {
            this._state.removeDrawElement(this._selectedFeatureId);
          }
        });
      }
    });

    this._listen({ shortcut: 'mod+1', drawModeOnly: true }).subscribe(this._draw(ZsMapDrawElementStateType.TEXT));
    this._listen({ shortcut: 'mod+2', drawModeOnly: true }).subscribe(this._draw(ZsMapDrawElementStateType.POLYGON));
    this._listen({ shortcut: 'mod+3', drawModeOnly: true }).subscribe(this._draw(ZsMapDrawElementStateType.LINE));
    this._listen({ shortcut: 'mod+4', drawModeOnly: true }).subscribe(this._draw(ZsMapDrawElementStateType.FREEHAND));
    this._listen({ shortcut: 'mod+5', drawModeOnly: true }).subscribe(this._draw(ZsMapDrawElementStateType.SYMBOL));
    this._listen({ shortcut: 'NumpadAdd', drawModeOnly: true }).subscribe(this._openAdd());
    //swiss german layout for +:
    this._listen({ shortcut: 'shift+1', drawModeOnly: true }).subscribe(this._openAdd());
    this._listen({ shortcut: 'NumpadDivide', drawModeOnly: true }).subscribe(this._triggerSearch());
    //swiss german layout for /:
    this._listen({ shortcut: 'shift+7', drawModeOnly: true }).subscribe(this._triggerSearch());

    this._listen({ shortcut: 'mod+c', drawModeOnly: true }).subscribe(async () => {
      if (this._session.isGuest()) {
        if (await firstValueFrom(this._session.observeIsGuestElementLimitReached())) {
          return;
        }
      }
      this._copyElement = this._selectedElement;
    });

    this._listen({ shortcut: 'mod+v', drawModeOnly: true }).subscribe(async () => {
      if (this._session.isGuest()) {
        if (await firstValueFrom(this._session.observeIsGuestElementLimitReached())) {
          return;
        }
      }
      if (this._copyElement?.elementState) {
        const currentCoordinates = await firstValueFrom(this._state.getCoordinates());
        const newState = cloneDeep(this._copyElement.elementState);

        // translate coordinates
        const getFirstCoordinate = (
          coordinates: undefined | number[] | number[][] | Coordinate,
        ): number[] | undefined => {
          if (!coordinates) {
            return;
          }
          if (typeof coordinates[0] === 'number') {
            return coordinates as number[];
          }
          if (Array.isArray(coordinates)) {
            return getFirstCoordinate(coordinates[0]);
          }
          return;
        };

        const firstCoordinates = getFirstCoordinate(newState.coordinates);
        const offset = [
          currentCoordinates[0] - (firstCoordinates?.[0] || 0),
          currentCoordinates[1] - (firstCoordinates?.[1] || 0),
        ];

        const offsetCoordinates = (coordinates: undefined | number[] | number[][] | Coordinate, offset: number[]) => {
          if (!coordinates) {
            return;
          }

          if (typeof coordinates[0] === 'number') {
            (coordinates as number[])[0] += offset[0];
            (coordinates as number[])[1] += offset[1];
          } else {
            if (Array.isArray(coordinates)) {
              for (const o of coordinates) {
                offsetCoordinates(o as number[], offset);
              }
            }
          }
        };

        offsetCoordinates(newState.coordinates, offset);

        this._state.addDrawElement(newState);
      }
    });

    this._listen({ shortcut: 'mod+y', drawModeOnly: true }).subscribe(() => {
      this._state.undoMapStateChange();
    });

    this._listen({ shortcut: 'mod+z', drawModeOnly: true }).subscribe(() => {
      this._state.redoMapStateChange();
    });

    this._listen({ shortcut: 'escape', drawModeOnly: true }).subscribe(() => {
      this._state.cancelDrawing();
    });
  }

  private _draw(type: ZsMapDrawElementStateType) {
    return () => {
      const layer = this._state.getActiveLayer();
      const success = layer?.draw(type);
      if (!success) {
        this._dialog.open(GuestLimitDialogComponent);
      }
    };
  }

  private _openAdd() {
    return () => {
      if (this._dialog.openDialogs.length === 0) {
        const layer = this._state.getActiveLayer();
        const ref = this._dialog.open(DrawDialogComponent);
        ref.componentRef?.instance.setLayer(layer);
      }
    };
  }

  private _triggerSearch() {
    return () => {
      this._search.triggerGlobalSearch();
    };
  }

  private _listen({ shortcut, preventDefault = true, drawModeOnly = false }: IShortcut): Observable<KeyboardEvent> {
    const keys = (shortcut?.split('+') || []).map((key) => key.trim().toLowerCase());

    const shiftKey = keys.includes('shift');
    const altKey = keys.includes('alt');
    const cmdOrCtrlKey = keys.includes('ctrl') || keys.includes('cmd') || keys.includes('mod') || keys.includes('meta');

    const keysWithoutModifiers = keys.filter(
      (key) => key !== 'shift' && key !== 'alt' && key !== 'ctrl' && key !== 'cmd' && key !== 'mod' && key !== 'meta',
    );

    const key = keysWithoutModifiers?.[0]?.toLowerCase();

    return this._keydownObserver.pipe(
      filter((event) => {
        if (drawModeOnly && (this._readOnlyMode || this._state.getActiveView() !== 'map')) {
          return false;
        }

        if (!shortcut || !key) {
          return true;
        }

        // While writing into an input, don't allow shortcuts
        if (this._inputs.includes((event.target as HTMLElement).tagName)) {
          return false;
        }

        const eventCmdOrCtrlKey = event.ctrlKey || event.metaKey;
        if (shiftKey !== event.shiftKey) {
          return false;
        }
        if (altKey !== event.altKey) {
          return false;
        }
        if (cmdOrCtrlKey !== eventCmdOrCtrlKey) {
          return false;
        }

        // use 'code' instead of 'key' to prevent 'Dead' keys on MacOS
        const keyCode = event.code.toLowerCase().replace('key', '').replace('digit', '');

        if (key === keyCode) {
          if (preventDefault) {
            event.preventDefault();
          }
          return true;
        }
        return false;
      }),
    );
  }
}
