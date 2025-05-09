import { Component, inject } from '@angular/core';
import { I18NService } from 'src/app/state/i18n.service';
import { IZsAccess } from '@zskarte/types';
import { ApiService } from 'src/app/api/api.service';
import { SessionService } from '../session.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-revoke-share-dialog',
  templateUrl: './revoke-share-dialog.component.html',
  styleUrl: './revoke-share-dialog.component.scss',
  imports: [MatTableModule, DatePipe, MatButtonModule],
})
export class RevokeShareDialogComponent {
  i18n = inject(I18NService);
  private _api = inject(ApiService);
  private session = inject(SessionService);
  private _snackBar = inject(MatSnackBar);

  shareLinks: IZsAccess[] = [];
  displayedColumns: string[] = ['createdAt', 'type', 'expiresOn', 'actions'];

  async ngOnInit() {
    const { error, result } = await this._api.get<IZsAccess[]>(
      `/api/accesses?sort[0]=type&operationId=${this.session.getOperationId()}`,
    );
    if (error || !result) return;
    this.shareLinks = result;
  }

  async revokeShareLink(documentId: string) {
    const { error } = await this._api.delete<IZsAccess>(`/api/accesses/${documentId}`);
    if (error) {
      this._snackBar.open(this.i18n.get('rewokeShareLinkFailedMessage'), this.i18n.get('ok'), { duration: 2000 });
    }

    this.shareLinks = this.shareLinks.filter((l) => l.documentId !== documentId);
  }
}
