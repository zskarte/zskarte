import {
  ChangeDetectorRef,
  Component, ElementRef,
  HostListener,
  Input,
  OnInit,
} from '@angular/core';
import { DrawlayerComponent } from '../drawlayer/drawlayer.component';
import { SharedStateService } from '../shared-state.service';
import {I18NService, LOCALES} from '../i18n.service';
import { Session } from '../entity/session';
import { SessionCreatorComponent } from '../session-creator/session-creator.component';
import { MatDialog } from '@angular/material/dialog';
import { PreferencesService } from '../preferences.service';
import { SessionsService } from '../sessions.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MapStoreService } from '../map-store.service';
import { ExportDialogComponent } from '../export-dialog/export-dialog.component';
import { DisplayMode } from '../entity/displayMode';
import { CustomImageStoreService } from '../custom-image-store.service';
import { HelpComponent } from '../help/help.component';
import {ImportDialogComponent} from "../import-dialog/import-dialog.component";
import {DomSanitizer} from "@angular/platform-browser";
import {TagStateComponent} from "../tag-state/tag-state.component";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
})
export class ToolbarComponent implements OnInit {
  get initialLaunch(): boolean {
    const currentOnboardingVersion = localStorage.getItem('onboardingVersion');
    if (currentOnboardingVersion !== ToolbarComponent.ONBOARDING_VERSION) {
      localStorage.setItem(
        'onboardingVersion',
        ToolbarComponent.ONBOARDING_VERSION
      );
      return true;
    }
    return false;
  }

  constructor(
    public i18n: I18NService,
    private cdr: ChangeDetectorRef,
    private sharedState: SharedStateService,
    public dialog: MatDialog,
    private preferences: PreferencesService,
    private sessions: SessionsService,
    private mapStore: MapStoreService,
    private sanitizer: DomSanitizer,
  ) {
    this.sharedState.displayMode.subscribe((mode) => {
      this.historyMode = mode === DisplayMode.HISTORY;
      window.history.pushState(null, '', '?mode=' + mode);
    });

    this.sharedState.sessionOutdated.subscribe((isOutdated) => {
      if (isOutdated) {
        this.createInitialSession();
      }
    });
    this.sharedState.historyDate.subscribe((historyDate) =>
      historyDate === 'now'
        ? (this.downloadTime = new Date().toISOString())
        : (this.downloadTime = historyDate)
    );
    if (this.initialLaunch) {
      this.dialog.open(HelpComponent, {
        data: true,
      });
    }
  }

  static ONBOARDING_VERSION = '1.0';

  @Input() drawLayer: DrawlayerComponent;
  session: Session;
  historyMode: boolean;
  collapsed: boolean;
  exportEnabled = true;
  downloadTime = null;
  downloadData = null;
  locales: string[] = LOCALES;

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Only handle global events (to prevent input elements to be considered)
    const globalEvent = event.target instanceof HTMLBodyElement;
    if (
      globalEvent &&
      !this.sharedState.featureSource.getValue() &&
      event.altKey
    ) {
      switch (event.code) {
        case 'KeyH':
          this.toggleHistory();
          break;
      }
    }
  }

  ngOnInit() {
    this.sharedState.session.subscribe((s) => {
      this.session = s;
      if (s) {
        const currentZSO = this.preferences.getZSO();
        this.exportEnabled = currentZSO != null && currentZSO.id != 'zso_guest';
        this.preferences.setLastSessionId(s.uuid);
      }
    });
    const lastSession = this.preferences.getLastSessionId();
    if (lastSession) {
      const session = this.sessions.getSession(lastSession);
      if (session) {
        this.sharedState.loadSession(JSON.parse(session));
        return;
      }
    }
    this.createInitialSession();
    if (!this.downloadTime) {
      this.downloadTime = new Date().toISOString();
    }
  }

  private createInitialSession() {
    this.dialog.open(SessionCreatorComponent, {
      data: {
        session: this.session,
        edit: false,
      },
      disableClose: true,
      width: '80vw',
      maxWidth: '80vw',
    });
  }

  createOrLoadSession() {
    this.dialog.open(SessionCreatorComponent, {
      data: {
        session: this.session,
        edit: false,
      },
      width: '80vw',
      maxWidth: '80vw',
    });
  }

  editSession() {
    this.dialog.open(SessionCreatorComponent, {
      data: {
        session: this.session,
        edit: true,
      },
      width: '80vw',
      maxWidth: '80vw',
    });
  }

  deleteSession(): void {
    if (this.session) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: this.i18n.get('confirmDeleteMap'),
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.mapStore.removeMap(this.session.uuid, true);
          this.sessions.removeSession(this.session.uuid);
          this.preferences.removeSessionSpecificPreferences(this.session.uuid);
          this.sharedState.loadSession(null);
          this.createInitialSession();
        }
      });
    }
  }

  exportSession(): void {
    const features = this.drawLayer.writeFeatures();
    this.dialog.open(ExportDialogComponent, {
      data: features,
    });
  }

  toggleHistory(): void {
    if (this.sharedState.displayMode.getValue() == DisplayMode.HISTORY) {
      this.sharedState.displayMode.next(DisplayMode.DRAW);
    } else {
      this.sharedState.displayMode.next(DisplayMode.HISTORY);
    }
  }

  help(): void {
    this.dialog.open(HelpComponent, { data: false });
  }

  importData(): void {
    const dialogRef = this.dialog.open(ImportDialogComponent, {
      maxWidth: '80vw',
      maxHeight: '80vh',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.value) {
        this.dialog
          .open(ConfirmationDialogComponent, {
            data: result.replace
              ? this.i18n.get('confirmImportDrawing')
              : this.i18n.get('confirmImportDrawingNoReplace'),
          })
          .afterClosed()
          .subscribe((confirmed) => {
            if (confirmed) {
              this.drawLayer.loadFromString(result.value, true, result.replace);
            }
          });
      }
    });
  }

  getDownloadFileName() {
    return 'zskarte_' + this.downloadTime + '.geojson';
  }

  download(): void {
    this.downloadData = this.sanitizer.bypassSecurityTrustUrl(
      this.drawLayer.toDataUrl()
    );
  }

  print(): void {
    window.print();
  }

  clear(): void {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: this.i18n.get('confirmClearDrawing'),
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.drawLayer.removeAll();
        }
      });
  }

  tagState(): void {
    const dialogRef = this.dialog.open(TagStateComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.mapStore.setTag(result).then(() => {});
      }
    });
  }

  setLocale(locale: string) {
    this.i18n.locale = locale;
  }
}
