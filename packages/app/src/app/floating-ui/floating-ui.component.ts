import { Component, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { BehaviorSubject, debounceTime, firstValueFrom, map, Observable, Subject, takeUntil } from 'rxjs';

import { ZsMapStateService } from '../state/state.service';
import { I18NService } from '../state/i18n.service';
import { SyncService } from '../sync/sync.service';
import { SessionService } from '../session/session.service';
import { ZsMapBaseLayer } from '../map-renderer/layers/base-layer';
import { DrawDialogComponent } from '../draw-dialog/draw-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { HelpComponent } from '../help/help.component';
import { SidebarContext } from '../sidebar/sidebar.interfaces';
import { SidebarService } from '../sidebar/sidebar.service';
import { ScaleSelectionComponent } from '../scale-selection/scale-selection.component';
import { db } from '../db/db';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatBadge } from '@angular/material/badge';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from '../sidebar/sidebar/sidebar.component';
import { SidebarHistoryComponent } from '../sidebar/sidebar-history/sidebar-history.component';
import { SidebarConnectionsComponent } from '../sidebar/sidebar-connections/sidebar-connections.component';
import { SidebarMenuComponent } from '../sidebar/sidebar-menu/sidebar-menu.component';
import { SidebarPrintComponent } from '../sidebar/sidebar-print/sidebar-print.component';
import { SidebarJournalComponent } from '../sidebar/sidebar-journal/sidebar-journal.component';
import { SelectedFeatureComponent } from '../selected-feature/selected-feature.component';
import { GeocoderComponent } from '../geocoder/geocoder.component';
import { CoordinatesComponent } from '../coordinates/coordinates.component';
import { ZsMapStateSource } from '@zskarte/types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAX_DRAW_ELEMENTS_GUEST } from '../session/default-map-values';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GuestLimitDialogComponent } from '../guest-limit-dialog/guest-limit-dialog.component';

@Component({
  selector: 'app-floating-ui',
  templateUrl: './floating-ui.component.html',
  styleUrl: './floating-ui.component.scss',
  imports: [
    MatIconModule,
    AsyncPipe,
    MatButtonModule,
    MatDivider,
    MatBadge,
    MatSidenavModule,
    SidebarComponent,
    SidebarHistoryComponent,
    SidebarConnectionsComponent,
    SidebarMenuComponent,
    SidebarPrintComponent,
    SidebarJournalComponent,
    SelectedFeatureComponent,
    GeocoderComponent,
    CoordinatesComponent,
    CommonModule,
  ],
})
export class FloatingUIComponent {
  MAX_DRAW_ELEMENTS_GUEST = MAX_DRAW_ELEMENTS_GUEST;
  i18n = inject(I18NService);
  state = inject(ZsMapStateService);
  private _sync = inject(SyncService);
  private _session = inject(SessionService);
  private _dialog = inject(MatDialog);
  session = inject(SessionService);
  sidebar = inject(SidebarService);
  snackbar = inject(MatSnackBar);
  mapState = inject(ZsMapStateService);

  static ONBOARDING_VERSION = '1.0';

  SidebarContext = SidebarContext;

  private _ngUnsubscribe = new Subject<void>();
  public connectionCount = new BehaviorSubject<number>(0);
  public isOnline = new BehaviorSubject<boolean>(true);
  public isReadOnly = this.state.observeIsReadOnly();
  public canUndo = new BehaviorSubject<boolean>(false);
  public canRedo = new BehaviorSubject<boolean>(false);
  public printView = false;
  public canWorkOffline = new BehaviorSubject<boolean>(false);
  public showLogo = true;
  public sidebarTitle = '';
  public logo = '';
  public workLocal = false;

  constructor() {
    if (this.isInitialLaunch()) {
      this._dialog.open(HelpComponent, {
        data: true,
      });
    }
    this.logo = this.session.getLogo() ?? '';
    this.workLocal = this.session.isWorkLocal();
    this.sidebar.observeContext()
    .pipe(takeUntil(this._ngUnsubscribe))
    .subscribe(sidebarContext => {
      switch (sidebarContext) {
        case SidebarContext.Layers:
          this.showLogo = false;
          this.sidebarTitle = this.i18n.get('view');
          break;
        case SidebarContext.History:
          this.showLogo = false;
          this.sidebarTitle = this.i18n.get('history');
          break;
        case SidebarContext.Connections:
          this.showLogo = false;
          this.sidebarTitle = this.i18n.get('connections');
          break;
        case SidebarContext.Print:
          this.showLogo = false;
          this.sidebarTitle = this.i18n.get('print');
          break;
        case SidebarContext.SelectedFeature:
          this.showLogo = false;
          this.sidebarTitle = this.i18n.get('selectedFeature');
          break;
        case SidebarContext.Journal:
          this.showLogo = false;
          this.sidebarTitle = this.i18n.get('journal');
          break;
        default:
          this.showLogo = true;
          this.sidebarTitle = this.session.getOperationName() ?? ''  
          break;
      }
    });

    this.state
      .observeHistory()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(({ canUndo, canRedo }) => {
        this.canUndo.next(canUndo);
        this.canRedo.next(canRedo);
      });

    this._session
      .observeIsOnline()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((isOnline) => {
        this.isOnline.next(isOnline);
      });

    this._sync
      .observeConnections()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((connections) => {
        this.connectionCount.next(connections.length);
      });

    if (this.workLocal) {
      this.state
        .observeDisplayState()
        .pipe(takeUntil(this._ngUnsubscribe),debounceTime(250))
        .subscribe(async (displayState) => {
          if (displayState.source === ZsMapStateSource.LOCAL || displayState.source === ZsMapStateSource.NONE) {
            //using local map
            if (displayState.layers.filter((l) => (l.type !== 'geojson' && l.type !== 'csv') ? !l.hidden : !l.offlineAvailable).length === 0) {
              //all used layer are offlineAvailable
              if (displayState.source === ZsMapStateSource.LOCAL) {
                const localMapInfo = await db.localMapInfo.get(displayState.source);
                if (localMapInfo?.offlineAvailable) {
                  //and it's saved on DB
                  if (!this.canWorkOffline.value) {
                    this.canWorkOffline.next(true);
                  }
                  return;
                }
              } else {
                if (!this.canWorkOffline.value) {
                  this.canWorkOffline.next(true);
                }
                return;
              }
            }
          }
          if (this.canWorkOffline.value) {
            this.canWorkOffline.next(false);
          }
        });
    }

    this.state
      .observePrintState()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((printState) => {
        this.printView = printState.printView;
      });
  }

  // skipcq:  JS-0105
  isInitialLaunch(): boolean {
    const currentOnboardingVersion = localStorage.getItem('onboardingVersion');
    if (currentOnboardingVersion !== FloatingUIComponent.ONBOARDING_VERSION) {
      localStorage.setItem('onboardingVersion', FloatingUIComponent.ONBOARDING_VERSION);
      return true;
    }
    return false;
  }

  zoomIn() {
    this.state.updateMapZoom(1);
  }

  zoomToScale() {
    const projectionDialog = this._dialog.open(ScaleSelectionComponent, {
      width: '500px',
      data: {
        scale: undefined,
        dpi: this.state.getDPI(),
      },
    });
    projectionDialog.afterClosed().subscribe((result) => {
      if (result) {
        this.state.setMapZoomScale(result.scale, result.dpi);
      }
    });
  }

  zoomOut() {
    this.state.updateMapZoom(-1);
  }

  undo() {
    this.state.undoMapStateChange();
  }

  redo() {
    this.state.redoMapStateChange();
  }

  public async openDrawDialog(): Promise<void> {
    const layer = await firstValueFrom(this.state.observeActiveLayer());
    const ref = this._dialog.open(DrawDialogComponent);
    ref.componentRef?.instance.setLayer(layer);
  }

  public openLimitDialog(limitReached: boolean | null) {
    if (limitReached) {
      this._dialog.open(GuestLimitDialogComponent);
    }
  }

  @HostListener('window:keydown.Control.p', ['$event'])
  @HostListener('window:keydown.Meta.p', ['$event'])
  @HostListener('window:beforeprint', ['$event'])
  onStartPrint(event: Event): void {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.sidebar.open(SidebarContext.Print);
  }

  @HostListener('window:keydown.Escape', ['$event'])
  closeSidebareOnEsc(): void {
    this.sidebar.close();
  }
}
