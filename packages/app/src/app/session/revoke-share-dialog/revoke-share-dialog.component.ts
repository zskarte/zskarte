import { Component, inject } from '@angular/core';
import { I18NService } from '../../state/i18n.service';
import { IZsAccess } from '@zskarte/types';
import { SessionService } from '../session.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { DialogBodyComponent, DialogHeaderComponent } from '../../ui/dialog-layout';
import { MatCard } from '@angular/material/card';
import { trpcRequest } from '../../api/trpc.error';
import { trpc } from '../../api/trpc.client';

@Component({
  selector: 'app-revoke-share-dialog',
  templateUrl: './revoke-share-dialog.component.html',
  styleUrl: './revoke-share-dialog.component.scss',
  imports: [MatTableModule, DatePipe, MatButtonModule, DialogHeaderComponent, DialogBodyComponent, MatCard],
})
export class RevokeShareDialogComponent {
  i18n = inject(I18NService);
  shareLinks: IZsAccess[] = [];
  displayedColumns: string[] = ['createdAt', 'type', 'expiresOn', 'actions'];
  private session = inject(SessionService);
  private _snackBar = inject(MatSnackBar);

  async ngOnInit() {
    const { error, result } = await trpcRequest(trpc.access.list.query({ operationId: this.session.getOperationId() }));
    if (error || !result) return;
    this.shareLinks = result;
  }

  async revokeShareLink(documentId: string) {
    const { error } = await trpcRequest(trpc.access.delete.mutate({ documentId }));
    if (error) {
      this._snackBar.open(this.i18n.get('rewokeShareLinkFailedMessage'), this.i18n.get('ok'), { duration: 2000 });
    }

    this.shareLinks = this.shareLinks.filter((l) => l.documentId !== documentId);
  }
}
