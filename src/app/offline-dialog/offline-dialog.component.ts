import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { I18NService } from '../state/i18n.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-offline-dialog',
  templateUrl: './offline-dialog.component.html',
  styleUrl: './offline-dialog.component.scss',
  imports: [MatButtonModule, MatDialogModule],
})
export class OfflineDialogComponent {
  dialogRef = inject<MatDialogRef<OfflineDialogComponent>>(MatDialogRef);
  i18n = inject(I18NService);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
