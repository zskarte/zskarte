import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DrawingDialogComponent } from '../drawing-dialog/drawing-dialog.component';
import { SharedStateService } from '../shared-state.service';
import { Sign } from '../entity/sign';
import { I18NService } from '../i18n.service';

@Component({
  selector: 'app-text-dialog',
  templateUrl: './text-dialog.component.html',
  styleUrls: ['./text-dialog.component.css'],
})
export class TextDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DrawingDialogComponent>,
    private sharedState: SharedStateService,
    public i18n: I18NService
  ) {}

  text: string = null;

  cancel(): void {
    this.dialogRef.close(null);
  }

  submit(): void {
    const textSign: Sign = {
      type: 'LineString',
      text: this.text,
      filterValue: 'text_element',
      src: null,
    };
    this.sharedState.selectSign(textSign);
    this.dialogRef.close(this.text);
  }
}
