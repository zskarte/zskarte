import { computed, inject, Injectable, signal } from '@angular/core';
import { SidebarContext } from './sidebar.interfaces';
import { filter, firstValueFrom, map, startWith } from 'rxjs';
import { ZsMapStateService } from '../state/state.service';
import { NavigationEnd, PRIMARY_OUTLET, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { I18NService } from '../state/i18n.service';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private _state = inject(ZsMapStateService);
  private _router = inject(Router);
  private _i18n = inject(I18NService);
  private _dialog = inject(MatDialog);

  public context = toSignal(
    this._router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => {
        const route = this._router.routerState.snapshot.root;
        const outletNode = route.children.find((child) => child.outlet === 'sidebar');
        return outletNode?.routeConfig?.path?.split('/')[0];
      }),
    ),
  );
  public isOpen = computed(() => Boolean(this.context()));
  public formDirty = signal(false);

  private async canChange() {
    if (this.formDirty()) {
      const confirm = this._dialog.open(ConfirmationDialogComponent, {
        data: this._i18n.get('closeNotSaved'),
      });
      return await firstValueFrom(confirm.afterClosed());
    }

    return true;
  }

  async close() {
    const canChange = await this.canChange();
    if (!canChange) {
      return;
    }

    this._state.resetSelectedFeature();
    return this._router.navigate([
      {
        outlets: {
          sidebar: null,
        },
      },
    ]);
  }

  async openWithPrimary(path: any[], primary?: any[]) {
    const canChange = await this.canChange();
    if (!canChange) {
      return;
    }

    const outlets = {
      sidebar: path,
    };

    if (primary) {
      outlets[PRIMARY_OUTLET] = primary;
    }

    void this._router.navigate([ { outlets } ]);
  }

  async open(context: SidebarContext, additional?: string) {
    return this.openWithPrimary([context, additional]);
  }

  toggle(context: SidebarContext): void {
    // this._context.value === context
    if (this.context() === context) {
      void this.close();
    } else {
      this.open(context);
    }
  }
}
