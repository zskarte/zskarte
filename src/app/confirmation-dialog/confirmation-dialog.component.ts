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

  cancel() {
    this.dialogRef.close(false);
  }

  ok() {
    this.dialogRef.close(true);
  }
}
