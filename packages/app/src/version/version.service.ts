import { inject, Injectable, signal } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { ConfirmationDialogComponent } from 'src/app/confirmation-dialog/confirmation-dialog.component';
import { I18NService } from 'src/app/state/i18n.service';
import { version } from '../../package.json';
import { InfoDialogComponent } from 'src/app/info-dialog/info-dialog.component';

export interface VersionInfos {
  version: string;
  buildDate?: string;
  changelog?: string;
}

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  private _swUpdate = inject(SwUpdate);
  private _dialog = inject(MatDialog);
  private _i18n = inject(I18NService);
  private notCompatibleDialogRef: MatDialogRef<InfoDialogComponent, any> | undefined;
  private newVersionDialogRef: MatDialogRef<ConfirmationDialogComponent, any> | undefined;
  readonly versionInfos = signal<VersionInfos>({ version: version as string });

  public initialize() {
    if (this._swUpdate.isEnabled) {
      this._swUpdate.versionUpdates.subscribe((event) => {
        if (event.type === 'VERSION_READY') {
          this.onNewVersionReady(event);
        } else if (event.type === 'NO_NEW_VERSION_DETECTED') {
          if (event.version.appData) {
            this.versionInfos.set(event.version.appData as any);
          }
        } else {
          console.info('service-worker, versionUpdates:', event);
        }
      });
    } else {
      console.debug('service worker not enabled');
    }
  }

  public checkForUpdate() {
    return this._swUpdate.checkForUpdate();
  }

  onNewVersionReady(event: VersionReadyEvent) {
    if (this.notCompatibleDialogRef) {
      this.notCompatibleDialogRef.close();
      this.notCompatibleDialogRef = undefined;
    }

    const current: VersionInfos = (event.currentVersion.appData as any) || this.versionInfos();
    const latest: VersionInfos = event.latestVersion.appData as any;

    if (current) {
      this.versionInfos.set(current);
    }
    this.newVersionDialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: {
        message: this._i18n.get('newVersion').replace('{0}', latest?.version).replace('{1}', current?.version),
        confirmLabel: this._i18n.get('reloadPage'),
      },
    });
    this.newVersionDialogRef.afterClosed().subscribe((confirmed) => {
      this.newVersionDialogRef = undefined;
      if (confirmed) {
        // reload of page will activate new version
        window.location.reload();
      }
    });
  }
}
