import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { I18NService } from '../state/i18n.service';
import { MatButtonModule } from '@angular/material/button';
import { lastValueFrom } from 'rxjs';
import { DialogHeaderComponent, DialogBodyComponent, DialogFooterComponent } from '../ui/dialog-layout';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-info-dialog',
  imports: [MatDialogModule, MatButtonModule, DialogHeaderComponent, DialogBodyComponent, DialogFooterComponent],
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

  public static async showErrorDialog(
    dialog: MatDialog,
    error: string,
    title: string | null = null,
    actionLabel?: string,
  ) {
    const dialogRef = dialog.open(InfoDialogComponent, {
      data: { error, title, actionLabel },
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

  private static escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private static highlightText(text: string | boolean | number, color: string): string {
    const escaped = typeof text === 'string' ? this.escapeHtml(text) : text;
    return `<span style="color: ${color};">${escaped}</span>`;
  }

  private static highlightObject(obj: any, indent = 0): string {
    if (obj === null) return this.highlightText('null', '#FF0000');
    if (typeof obj === 'boolean') return this.highlightText(obj, '#FF0000');
    if (typeof obj === 'number') return this.highlightText(obj, '#C50F1F');
    if (typeof obj === 'string') return this.highlightText(`"${obj}"`, '#067D17');

    const pad = '  '.repeat(indent);
    let result = '';
    if (Array.isArray(obj)) {
      result = `${this.highlightText('[', '#808080')}\n`;
      obj.forEach((item: any, i: number) => {
        if (i > 0) result += ',\n';
        result += `${pad}  ${this.highlightObject(item, indent + 1)}`;
      });
      result += `\n${pad}${this.highlightText(']', '#808080')}`;
    } else if (typeof obj === 'object') {
      result = `${this.highlightText('{', '#808080')}\n`;
      const entries = Object.entries(obj);
      entries.forEach(([key, val], i: number) => {
        if (i > 0) result += ',\n';
        result += `${pad}  ${this.highlightText(key, '#0000FF; font-weight: bold')}${this.highlightText(':', '#808080')} ${this.highlightObject(val, indent + 1)}`;
      });
      result += `\n${pad}${this.highlightText('}', '#808080')}`;
    }
    return result;
  }

  public static showJSONDialog(dialog: MatDialog, domSanitizer: DomSanitizer, title: string, json: object) {
    const html: SafeHtml | null = domSanitizer.bypassSecurityTrustHtml(
      '<div style="background: #f8f8f8; padding: 10px; font-family: monospace; white-space: pre-wrap;">' +
        this.highlightObject(json) +
        '</div>',
    );

    dialog.open(InfoDialogComponent, {
      data: { title, html },
      height: '80vh',
      width: '80vw',
    });
  }
}
