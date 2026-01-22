import { computed, inject, Injectable } from '@angular/core';
import { SidebarContext } from './sidebar.interfaces';
import { filter, map, startWith } from 'rxjs';
import { ZsMapStateService } from '../state/state.service';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private _state = inject(ZsMapStateService);
  private _router = inject(Router);

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

  close(): void {
    void this._router.navigate([
      {
        outlets: {
          sidebar: null,
        },
      },
    ]);
    this._state.resetSelectedFeature();
  }

  open(context: SidebarContext): void {
    if (this.context() !== context) {
      //deselect element if switched to other sidebar
      this._state.resetSelectedFeature();
    }
    void this._router.navigate([
      {
        outlets: {
          sidebar: context,
        },
      },
    ]);
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
