import { Injectable, inject } from '@angular/core';
import { SidebarContext } from './sidebar.interfaces';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { ZsMapStateService } from '../state/state.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private _state = inject(ZsMapStateService);
  private router = inject(Router);

  private _context = new BehaviorSubject<SidebarContext | undefined>(undefined);
  private _preventDeselect = false;
  private _preventClose = false;

  constructor() {
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
    if (!this._preventDeselect) {
      this._state.resetSelectedFeature();
    }
    this._context.next(undefined);
    this._preventDeselect = false;
    this.removeFragment();
  }

  //the fragment is used in MapComponent to activate a specific sidebar
  removeFragment() {
    this.router.navigate([], {
      relativeTo: this.router.routerState.root,
      queryParamsHandling: 'preserve',
      preserveFragment: false,
    });
  }

  open(context: SidebarContext): void {
    if (this._context.value !== context && !this._preventDeselect) {
      //deselect element if switched to other sidebar
      this._preventClose = true;
      this._state.resetSelectedFeature();
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
