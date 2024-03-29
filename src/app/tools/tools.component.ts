import { Component, HostListener, Input, OnInit } from '@angular/core';
import { DrawlayerComponent } from '../drawlayer/drawlayer.component';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { ImportDialogComponent } from '../import-dialog/import-dialog.component';
import { I18NService } from '../i18n.service';
import { SharedStateService } from '../shared-state.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { TagStateComponent } from '../tag-state/tag-state.component';
import { MapStoreService } from '../map-store.service';
import { DisplayMode } from '../entity/displayMode';
import { KeyboardHandler, KeyboardHandlerContainer } from '../keyboard.service';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css'],
})
export class ToolsComponent implements OnInit {
  @Input() drawLayer: DrawlayerComponent;
  downloadData = null;
  downloadTime = null;
  historyMode: boolean;

  constructor(
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
    public i18n: I18NService,
    private sharedState: SharedStateService,
    private mapStore: MapStoreService,
    private keyboardHandler: KeyboardHandler
  ) {
    this.sharedState.displayMode.subscribe((d) => {
      this.historyMode = d === DisplayMode.HISTORY;
    });
    this.historyMode =
      this.sharedState.displayMode.getValue() === DisplayMode.HISTORY;
    this.sharedState.historyDate.subscribe((historyDate) =>
      historyDate === 'now'
        ? (this.downloadTime = new Date().toISOString())
        : (this.downloadTime = historyDate)
    );
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

  ngOnInit() {
    if (!this.downloadTime) {
      this.downloadTime = new Date().toISOString();
    }
  }

  download(): void {
    this.downloadData = this.sanitizer.bypassSecurityTrustUrl(
      this.drawLayer.toDataUrl()
    );
  }

  tagState(): void {
    const dialogRef = this.dialog.open(TagStateComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.mapStore.setTag(result).then(() => {});
      }
    });
  }

  print(): void {
    window.print();
  }
}
