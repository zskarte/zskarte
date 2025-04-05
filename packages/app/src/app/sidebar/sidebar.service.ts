import { Injectable, effect, inject } from '@angular/core';
import { SidebarContext } from './sidebar.interfaces';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { ZsMapStateService } from '../state/state.service';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private _state = inject(ZsMapStateService);

  private _context = new BehaviorSubject<SidebarContext | undefined>(undefined);
  private _preventDeselect = false;
  private _preventClose = false;

  constructor() {
    effect(() => {
      const fragment = this._state.urlFragment();
      if (fragment?.startsWith('message=')) {
        this.open(SidebarContext.Journal);
      }
    });
    combineLatest([this._state.observeSelectedFeature$(), this._state.observeHideSelectedFeature$()]).subscribe(
      ([element, hide]) => {
        this._preventDeselect = true;
        if (element && !hide) {
          this.open(SidebarContext.SelectedFeature);
        } else if (!this._preventClose) {
          this.close();
        }
        this._preventClose = false;
      },
    );
  }

  close(): void {
    if (!this._context.value) {
      return;
    }
    this._context.next(undefined);
    if (!this._preventDeselect) {
      this._state.resetSelectedFeature();
    }
    this._preventDeselect = false;
    this._state.removeUrlFragment('message=');
  }

  open(context: SidebarContext): void {
    if (this._context.value !== context && !this._preventDeselect) {
      //deselect element if switched to other sidebar
      this._preventClose = true;
      this._state.resetSelectedFeature();
    }
    if (context !== SidebarContext.Journal) {
      this._state.removeUrlFragment('message=');
    }
    this._context.next(context);
    this._preventDeselect = false;
  }

  toggle(context: SidebarContext): void {
    if (this._context.value === context) {
      this.close();
    } else {
      this.open(context);
    }
  }

  observeIsOpen(): Observable<boolean> {
    return this._context.pipe(map((context) => context !== undefined));
  }

  observeContext(): Observable<SidebarContext | undefined> {
    return this._context.asObservable();
  }
}
