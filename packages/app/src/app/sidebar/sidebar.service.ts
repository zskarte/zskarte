import { computed, inject, Injectable } from '@angular/core';
import { SidebarContext } from './sidebar.interfaces';
import { combineLatest, filter, map, skip, startWith } from 'rxjs';
import { ZsMapStateService } from '../state/state.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private _state = inject(ZsMapStateService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);

  private _preventDeselect = false;
  private _preventClose = false;

  public context = toSignal(
    this._router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => {
        const route = this._router.routerState.snapshot.root;
        const outletNode = route.children.find((child) => child.outlet === 'sidebar');
        return outletNode?.routeConfig?.path as SidebarContext | null;
      }),
    ),
  );
  public isOpen = computed(() => Boolean(this.context()));

  constructor() {
    combineLatest([this._state.observeSelectedFeature$(), this._state.observeHideSelectedFeature$()])
      .pipe(skip(1)) // skip initial load
      .subscribe(([element, hide]) => {
        this._preventDeselect = true;
        if (element && !hide) {
          this.open(SidebarContext.SelectedFeature);
        } else if (!this._preventClose) {
          this.close();
        }
        this._preventClose = false;
      });
  }

  close(): void {
    void this._router.navigate(
      [
        {
          outlets: {
            sidebar: null,
          },
        },
      ]
    );
    if (!this._preventDeselect) {
      this._state.resetSelectedFeature();
    }
    this._preventDeselect = false;
  }

  open(context: SidebarContext): void {
    if (this.context() !== context && !this._preventDeselect) {
      //deselect element if switched to other sidebar
      this._preventClose = true;
      this._state.resetSelectedFeature();
    }
    void this._router.navigate(
      [
        {
          outlets: {
            sidebar: context,
          },
        },
      ]
    );
    this._preventDeselect = false;
  }

  toggle(context: SidebarContext): void {
    // this._context.value === context
    if (this.context() === context) {
      this.close();
    } else {
      this.open(context);
    }
  }
}
