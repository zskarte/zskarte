import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { I18NService } from '../state/i18n.service';
import { MatButtonModule } from '@angular/material/button';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-info-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './info-dialog.component.html',
  styleUrl: './info-dialog.component.scss',
})
export class InfoDialogComponent {
  dialogRef = inject<MatDialogRef<InfoDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  i18n = inject(I18NService);

  close() {
    this.dialogRef.close();
  }

  public static async showHtmlDialog(dialog: MatDialog, html: string, title: string | null = null) {
    const dialogRef = dialog.open(InfoDialogComponent, {
      data: { html, title },
    });
    await lastValueFrom(dialogRef.afterClosed());
  }

  public static async showTextDialog(dialog: MatDialog, text: string, title: string | null = null) {
    const dialogRef = dialog.open(InfoDialogComponent, {
      data: { text, title },
    });
    await lastValueFrom(dialogRef.afterClosed());
  }

  public static async showErrorDialog(dialog: MatDialog, error: string, title: string | null = null) {
    const dialogRef = dialog.open(InfoDialogComponent, {
      data: { error, title },
    });
    await lastValueFrom(dialogRef.afterClosed());
  }
}
