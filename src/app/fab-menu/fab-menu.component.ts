import { Component, HostListener, OnInit } from '@angular/core';
import { DrawingDialogComponent } from '../drawing-dialog/drawing-dialog.component';
import { TextDialogComponent } from '../text-dialog/text-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SharedStateService } from '../shared-state.service';
import { I18NService } from '../i18n.service';
import { DisplayMode } from '../entity/displayMode';
import { KeyboardHandler, KeyboardHandlerContainer } from '../keyboard.service';

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
    public i18n: I18NService,
    private keyboard: KeyboardHandler
  ) {}

  ngOnInit(): void {
    this.sharedState.displayMode.subscribe((mode) => {
      this.historyMode = mode === DisplayMode.HISTORY;
    });
    this.keyboard.subscribe(
      new KeyboardHandlerContainer(
        'KeyX',
        (global: boolean) =>
          this.onKeyDown(() => this.openTextDialog(), global),
        'shortcut_openTextDialog',
        undefined,
        true
      ),
      new KeyboardHandlerContainer(
        'KeyS',
        (global: boolean) =>
          this.onKeyDown(() => this.openDrawDialog(), global),
        'shortcuts_openSigDialog',
        undefined,
        true
      ),
      new KeyboardHandlerContainer(
        'KeyP',
        (global: boolean) => this.onKeyDown(() => this.polygon(), global),
        'shortcuts_drawPolygon',
        undefined,
        true
      ),
      new KeyboardHandlerContainer(
        'KeyL',
        (global: boolean) => this.onKeyDown(() => this.line(), global),
        'shortcuts_drawLine',
        undefined,
        true
      ),
      new KeyboardHandlerContainer(
        'KeyO',
        (global: boolean) =>
          this.onKeyDown(() => this.toggleFreeHandDraw(), global),
        'shortcuts_toggleFreehand',
        undefined,
        true
      )
    );
  }

  onKeyDown(callback: () => void, global: boolean) {
    if (global && !this.sharedState.featureSource.getValue()) {
      callback();
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
