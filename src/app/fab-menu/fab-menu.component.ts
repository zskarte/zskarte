import { Component, HostListener, OnInit } from '@angular/core';
import { DrawingDialogComponent } from '../drawing-dialog/drawing-dialog.component';
import { TextDialogComponent } from '../text-dialog/text-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SharedStateService } from '../shared-state.service';
import { I18NService } from '../i18n.service';
import { DisplayMode } from '../entity/displayMode';

@Component({
  selector: 'app-fab-menu',
  templateUrl: './fab-menu.component.html',
  styleUrls: ['./fab-menu.component.css'],
})
export class FabMenuComponent implements OnInit {
  text: string = null;
  isOpen = false;
  historyMode: boolean;

  constructor(
    public drawDialog: MatDialog,
    public textDialog: MatDialog,
    private sharedState: SharedStateService,
    public i18n: I18NService
  ) {}

  ngOnInit(): void {
    this.sharedState.displayMode.subscribe((mode) => {
      this.historyMode = mode === DisplayMode.HISTORY;
    });
  }

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
        case 'KeyX':
          this.openTextDialog();
          break;
        case 'KeyS':
          this.openDrawDialog();
          break;
        case 'KeyP':
          this.polygon();
          break;
        case 'KeyL':
          this.line();
          break;
      }
    }
  }

  openDrawDialog(): void {
    this.sharedState.disableFreeHandDraw();
    const dialogRef = this.drawDialog.open(DrawingDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.sharedState.selectSign(result);
      }
      this.closeBackdrop();
    });
  }

  openTextDialog(): void {
    this.sharedState.disableFreeHandDraw();
    const dialogRef = this.textDialog.open(TextDialogComponent, {
      maxWidth: '80vw',
      maxHeight: '70vh',
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.text = result;
      this.closeBackdrop();
    });
  }

  polygon(): void {
    this.sharedState.disableFreeHandDraw();
    this.sharedState.selectSign({
      type: 'Polygon',
      src: null,
      filterValue: 'not_labeled_polygon',
    });
    this.closeBackdrop();
  }

  line(): void {
    this.sharedState.disableFreeHandDraw();
    this.sharedState.selectSign({
      type: 'LineString',
      src: null,
      filterValue: 'not_labeled_line',
    });
    this.closeBackdrop();
  }

  circle(): void {
    this.sharedState.disableFreeHandDraw();
    this.sharedState.selectSign({
      type: 'Circle',
      src: null,
    });
    this.closeBackdrop();
  }

  toggleFreeHandDraw(): void {
    this.sharedState.toggleFreeHandDraw();
    this.closeBackdrop();
  }

  closeBackdrop(): void {
    this.isOpen = false;
  }
}
