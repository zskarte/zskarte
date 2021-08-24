import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DrawingDialogComponent } from '../drawing-dialog/drawing-dialog.component';
import { SharedStateService } from '../shared-state.service';
import { TextDialogComponent } from '../text-dialog/text-dialog.component';
import { I18NService } from '../i18n.service';

export interface Filter {
  value: string;
  viewValue: string;
  color: string;
  textcolor: string;
}

@Component({
  selector: 'app-drawingtools',
  templateUrl: './drawingtools.component.html',
  styleUrls: ['./drawingtools.component.css'],
})
export class DrawingtoolsComponent {
  text: string = null;

  constructor(
    public drawDialog: MatDialog,
    public textDialog: MatDialog,
    private sharedState: SharedStateService,
    public i18n: I18NService
  ) {}

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
    const dialogRef = this.drawDialog.open(DrawingDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      this.sharedState.selectSign(result);
    });
  }

  openTextDialog(): void {
    const dialogRef = this.textDialog.open(TextDialogComponent, {
      maxWidth: '80vw',
      maxHeight: '70vh',
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.text = result;
    });
  }

  polygon(): void {
    this.sharedState.selectSign({
      type: 'Polygon',
      src: null,
      filterValue: 'not_labeled_polygon',
    });
  }

  line(): void {
    this.sharedState.selectSign({
      type: 'LineString',
      src: null,
      filterValue: 'not_labeled_line',
    });
  }

  circle(): void {
    this.sharedState.selectSign({
      type: 'Circle',
      src: null,
    });
  }
}
