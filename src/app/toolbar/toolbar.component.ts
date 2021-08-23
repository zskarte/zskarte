/*
 * Copyright © 2018-2020 ZSO Bern Plus / PCi Fribourg
 *
 * This file is part of Zivilschutzkarte 2.
 *
 * Zivilschutzkarte 2 is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * Zivilschutzkarte 2 is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along with
 * Zivilschutzkarte 2.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 */

import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnInit,
} from '@angular/core';
import { DrawlayerComponent } from '../drawlayer/drawlayer.component';
import { SharedStateService } from '../shared-state.service';
import { I18NService } from '../i18n.service';
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
    private mapStore: MapStoreService
  ) {
    this.sharedState.displayMode.subscribe((mode) => {
      this.historyMode = mode === DisplayMode.HISTORY;
      window.history.pushState(null, '', '?mode=' + mode);
    });
    this.sharedState.drawingManipulated.subscribe((updated) => {
      if (updated) {
        this.updateFilterSymbols();
      }
    });
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
  filterKeys: any[];
  filterSymbols: any[];
  collapsed: boolean;
  exportEnabled = true;

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Only handle global events (to prevent input elements to be considered)
    const globalEvent = event.target instanceof HTMLBodyElement;
    if (
      globalEvent &&
      !this.sharedState.featureSource.getValue() &&
      event.altKey
    ) {
      switch (event.key) {
        case 'h':
          this.toggleHistory();
          break;
      }
    }
  }

  extractSymbol(f, symbols) {
    const sig = f.get('sig');
    if (sig && sig.src) {
      if (!symbols[sig.src]) {
        const dataUrl = CustomImageStoreService.getImageDataUrl(sig.src);
        symbols[sig.src] = {
          label: this.i18n.getLabelForSign(sig),
          origSrc: sig.src,
          src: dataUrl ? dataUrl : 'assets/img/signs/' + sig.src,
        };
      }
    }
  }

  updateFilterSymbols() {
    const symbols = {};
    if (this.drawLayer && this.drawLayer.source) {
      this.drawLayer.source
        .getFeatures()
        .forEach((f) => this.extractSymbol(f, symbols));
      if (this.historyMode) {
        this.drawLayer.clusterSource
          .getFeatures()
          .forEach((f) => this.extractSymbol(f, symbols));
      }
      this.filterKeys = Object.keys(symbols);
      
      this.filterSymbols = Object.values(symbols).sort((a: any, b: any) =>
        a.label.localeCompare(b.label)
      );
    }
  }

  ngOnInit() {
    this.sharedState.showMapLoader.subscribe((l) => {
      if (!l) {
        // The loader has been hidden -> we should check if we have new symbols for filters.
        this.updateFilterSymbols();
      }
    });
    this.sharedState.session.subscribe((s) => {
      this.session = s;
      if (s) {
        let currentZSO = this.preferences.getZSO();
        this.exportEnabled = (currentZSO != null && currentZSO.id != "zso_guest");
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
  }

  private filterAll(active: boolean) {
    this.drawLayer.toggleFilters(this.filterKeys, active);
  }

  private createInitialSession() {
    this.dialog.open(SessionCreatorComponent, {
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

  zoomIn(): void {
    this.sharedState.zoom.next(1);
  }

  zoomOut(): void {
    this.sharedState.zoom.next(-1);
  }

  help(): void {
    this.dialog.open(HelpComponent, { data: false });
  }
}
