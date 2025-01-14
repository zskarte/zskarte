import { Component, inject, input } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SelectSignDialog } from '../select-sign-dialog/select-sign-dialog.component';
import { ZsMapDrawLayer } from '../map-renderer/layers/draw-layer';
import { I18NService } from '../state/i18n.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-text-dialog',
  templateUrl: './text-dialog.component.html',
  styleUrls: ['./text-dialog.component.scss'],
  imports: [MatFormFieldModule, MatInputModule, MatDialogModule, FormsModule],
})
export class TextDialogComponent {
  dialogRef = inject<MatDialogRef<SelectSignDialog>>(MatDialogRef);
  i18n = inject(I18NService);

  readonly layer = input<ZsMapDrawLayer>();
  text = '';

  cancel(): void {
    this.dialogRef.close(null);
  }

  submit(): void {
    this.dialogRef.close(this.text);
  }
}
