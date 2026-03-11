import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { I18NService } from '../state/i18n.service';
import { MatButtonModule } from '@angular/material/button';
import { DialogHeaderComponent, DialogBodyComponent, DialogFooterComponent } from '../ui/dialog-layout';
import { MatCard } from "@angular/material/card";

export interface ConfirmationDialogData {
  title?: string;
  message?: string;
  html?: string;
  cancelLabel?: string;
  confirmLabel?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  imports: [MatDialogModule, MatDialogClose, MatButtonModule, DialogHeaderComponent, DialogBodyComponent, DialogFooterComponent, MatCard],
})
export class ConfirmationDialogComponent {
  private dialogRef = inject<MatDialogRef<ConfirmationDialogComponent>>(MatDialogRef);
  protected data = inject<ConfirmationDialogData>(MAT_DIALOG_DATA);
  protected i18n = inject(I18NService);
}
