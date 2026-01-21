import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { I18NService } from '../state/i18n.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
  imports: [MatDialogModule, MatButtonModule],
})
export class ConfirmationDialogComponent {
  dialogRef = inject<MatDialogRef<ConfirmationDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  i18n = inject(I18NService);

  get cancelLabel(): string {
    return typeof this.data === 'object' && this.data !== null && 'cancelLabel' in this.data
      ? this.data.cancelLabel
      : this.i18n.get('cancel');
  }

  get confirmLabel(): string {
    return typeof this.data === 'object' && this.data !== null && 'confirmLabel' in this.data
      ? this.data.confirmLabel
      : this.i18n.get('confirm');
  }

  get message(): string {
    return typeof this.data === 'object' && this.data !== null && 'message' in this.data
      ? this.data.message
      : typeof this.data === 'string'
        ? this.data
        : '';
  }

  cancel() {
    this.dialogRef.close(false);
  }

  ok() {
    this.dialogRef.close(true);
  }
}
