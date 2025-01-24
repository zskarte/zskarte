import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ZsMapDrawElementStateType } from '@zskarte/types';
import { Observable, firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { GuestLimitDialogComponent } from '../guest-limit-dialog/guest-limit-dialog.component';
import { ZsMapBaseDrawElement } from '../map-renderer/elements/base/base-draw-element';
import { SessionService } from '../session/session.service';
import { ZsMapStateService } from '../state/state.service';
import { IShortcut } from './shortcut.interfaces';

@Injectable({
  providedIn: 'root',
})
export class ShortcutService {
  private _session = inject(SessionService);
  private _state = inject(ZsMapStateService);
  private _dialog = inject(MatDialog);

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

    this._state.observeIsReadOnly().subscribe((readOnlyMode) => {
      this._readOnlyMode = readOnlyMode;
    });
  }

  public initialize(): void {
    this._listen({ shortcut: 'mod+backspace', drawModeOnly: true }).subscribe(() => {
      if (this._selectedFeatureId) {
        this._state.removeDrawElement(this._selectedFeatureId);
      }
    });

    this._listen({ shortcut: 'mod+1', drawModeOnly: true }).subscribe(this._draw(ZsMapDrawElementStateType.TEXT));
    this._listen({ shortcut: 'mod+2', drawModeOnly: true }).subscribe(this._draw(ZsMapDrawElementStateType.POLYGON));
    this._listen({ shortcut: 'mod+3', drawModeOnly: true }).subscribe(this._draw(ZsMapDrawElementStateType.LINE));
    this._listen({ shortcut: 'mod+4', drawModeOnly: true }).subscribe(this._draw(ZsMapDrawElementStateType.FREEHAND));
    this._listen({ shortcut: 'mod+5', drawModeOnly: true }).subscribe(this._draw(ZsMapDrawElementStateType.SYMBOL));

    this._listen({ shortcut: 'mod+c' }).subscribe(async () => {
      if (this._session.isGuest()) {
        if (await firstValueFrom(this._session.observeIsGuestElementLimitReached())) {
          return;
        }
      }
      this._copyElement = this._selectedElement;
    });

    this._listen({ shortcut: 'mod+v', drawModeOnly: true }).subscribe(() => {
      if (this._copyElement?.elementState) {
        this._state.addDrawElement(this._copyElement.elementState);
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
        if (drawModeOnly && this._readOnlyMode) {
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
