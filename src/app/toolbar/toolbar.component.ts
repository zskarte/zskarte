import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit, ViewChild,
} from '@angular/core';
import { DrawlayerComponent } from '../drawlayer/drawlayer.component';
import { SharedStateService } from '../shared-state.service';
import { I18NService, LOCALES } from '../i18n.service';
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
import { ImportDialogComponent } from '../import-dialog/import-dialog.component';
import { DomSanitizer } from '@angular/platform-browser';
import { TagStateComponent } from '../tag-state/tag-state.component';
import { KeyboardHandler, KeyboardHandlerContainer } from '../keyboard.service';
import { ShortcutDialogComponent } from '../shortcut-dialog/shortcut-dialog.component';
import {MatMenuTrigger} from "@angular/material/menu";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
})
export class ToolbarComponent implements OnInit {
  @ViewChild(MatMenuTrigger) menu: MatMenuTrigger;

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
    private keyboardHandler: KeyboardHandler
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

    keyboardHandler.subscribe(
      new KeyboardHandlerContainer(
        'KeyH',
        (global: boolean) => this.onKeyDown(() => this.toggleHistory(), global),
        'shortcuts_toggleHistory',
        'shortcuts_toolbar',
        true
      ),
      new KeyboardHandlerContainer(
        'KeyI',
        (global: boolean) => this.onKeyDown(() => this.importData(), global),
        'downloadMap',
        'shortcuts_toolbar',
        true
      ),
      new KeyboardHandlerContainer(
        'KeyT',
        (global: boolean) => this.onKeyDown(() => this.importData(), global),
        'shortcuts_tagState',
        'shortcuts_toolbar',
        true
      ),
      new KeyboardHandlerContainer(
        'Delete',
        (global: boolean) => this.onKeyDown(() => this.clear(), global),
        'deleteMap',
        'shortcuts_toolbar',
        true
      ),
      new KeyboardHandlerContainer(
        'Backspace',
        (global: boolean) => this.onKeyDown(() => this.clear(), global),
        'deleteMap',
        'shortcuts_toolbar',
        true
      )
    );
  }

  onKeyDown(callback: () => void, global: boolean) {
    if (global && !this.sharedState.featureSource.getValue()) {
      callback();
    }
  }

  static ONBOARDING_VERSION = '1.0';

  @Input() drawLayer: DrawlayerComponent;
  session: Session;
  historyMode: boolean;
  filterKeys: any[];
  filterSymbols: any[];
  exportEnabled = true;
  downloadTime = null;
  downloadData = null;
  downloadCSVData = null;
  locales: string[] = LOCALES;

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

  manual(): void {
    this.dialog.open(HelpComponent, { data: false });
  }

  shortcuts(): void {
    this.dialog.open(ShortcutDialogComponent, {
      data: { handlers: this.keyboardHandler.handlers },
    });
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
    if (!this.downloadTime) {
      this.downloadTime = new Date().toISOString();
    }
    return 'zskarte_' + this.downloadTime + '.geojson';
  }

  download(): void {
    this.downloadData = this.sanitizer.bypassSecurityTrustUrl(
      this.drawLayer.toDataUrl()
    );
  }

  getDownloadFileNameCSV() {
    if (!this.downloadTime) {
      this.downloadTime = new Date().toISOString();
    }
    return 'zskarte_' + this.downloadTime + '.csv';
  }

  downloadCSV(): void {
    this.downloadCSVData = this.sanitizer.bypassSecurityTrustUrl(
      this.drawLayer.toCSVDataUrl()
    );
  }

  print(): void {
    this.menu.closeMenu();
    setTimeout(() => {
      window.print();
    }, 0);
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

  toggleHistoryIfButton(event: MouseEvent) {
    const element = event.target as HTMLElement;
    if (element.id === 'historyButton') {
      this.toggleHistory();
    }
    event.stopPropagation();
  }
}
