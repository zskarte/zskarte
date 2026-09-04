import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import QRCode from 'qrcode';
import { I18NService } from '../../state/i18n.service';
import { DialogBodyComponent, DialogHeaderComponent } from '../../ui/dialog-layout';

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.scss'],
  imports: [AsyncPipe, DialogHeaderComponent, DialogBodyComponent],
})
export class ShareDialogComponent {
  joinCode = inject(MAT_DIALOG_DATA);
  i18n = inject(I18NService);
  public qrCodeDataUrl!: Promise<string>;
  public showJoinCode: boolean;
  private _snackBar = inject(MatSnackBar);

  constructor() {
    const joinCode = this.joinCode;

    this.qrCodeDataUrl = this.generateQrCodeDataUrl();
    this.copyJoinLink();
    // Only show join code if access has an user friendly join code (six digits long).
    this.showJoinCode = joinCode.length === 6;
  }

  public get joinLink(): string {
    return `${window.location.origin}/share/${this.joinCode}`;
  }

  async copyJoinLink() {
    await navigator.clipboard.writeText(this.joinLink);
    this._snackBar.open(this.i18n.get('copiedToClipboard'), this.i18n.get('ok'), { duration: 2000 });
  }

  private generateQrCodeDataUrl(): Promise<string> {
    return QRCode.toDataURL(this.joinLink, {
      width: 420,
    }).catch((err) => {
      console.error(`Error generating QR Code for ${this.joinLink}:`, err);
      return '';
    });
  }
}
