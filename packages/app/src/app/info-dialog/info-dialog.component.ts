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

  public static async showSaveErrorDialog(
    dialog: MatDialog,
    i18n: I18NService,
    errorResponse: any,
    title: string | null = null,
  ) {
    let error = i18n.get('errorSaving');
    if (typeof errorResponse === 'object' && errorResponse.localOnly) {
      error = i18n.get('storedLocallyOnly');
    } else if (typeof errorResponse === 'object' && errorResponse.message) {
      if (title) {
        error += ': ' + errorResponse.message;
      } else {
        title = error;
        error = errorResponse.message;
      }
    } else if (typeof errorResponse === 'object' && errorResponse.error?.message) {
      let message = errorResponse.error?.message;
      if (errorResponse.error?.details?.errors) {
        message = '';
        for (const error of errorResponse.error?.details?.errors) {
          if (error.path) {
            message += error.path.join('/') + ': ';
          }
          message += error.message + '\n';
        }
      }
      if (title) {
        error += ':\n' + message;
      } else {
        title = error;
        error = message;
      }
    }

    const dialogRef = dialog.open(InfoDialogComponent, {
      data: { error, title },
    });
    await lastValueFrom(dialogRef.afterClosed());
  }
}
