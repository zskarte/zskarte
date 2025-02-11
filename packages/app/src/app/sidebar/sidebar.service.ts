import { Injectable, inject } from '@angular/core';
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

  constructor() {
    combineLatest([
      this._state.observeSelectedFeature$(),
      this._state.observeHideSelectedFeature$()  
    ]).subscribe(([element, hide]) => {
      if (element && !hide) {
        this.open(SidebarContext.SelectedFeature);
      } else {
        this._preventDeselect = true;
        this.close();
      }
    });
  }

  close(): void {
    if (!this._preventDeselect) {
      this._state.resetSelectedFeature();
    }
    this._context.next(undefined);
    this._preventDeselect = false;
  }

  open(context: SidebarContext): void {
    this._context.next(context);
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
