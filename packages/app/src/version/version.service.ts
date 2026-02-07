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
    let message: string | undefined = this._i18n
      .get('newVersion')
      .replace('{0}', latest?.version)
      .replace('{1}', current?.version);
    let title: string | undefined = undefined;
    let html: string | undefined = undefined;
    if (latest.changelog) {
      title = message;
      message = undefined;
      html = this.convertChangelogToHtml(latest.changelog);
    }

    this.newVersionDialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: {
        title,
        message,
        html,
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

  private convertChangelogToHtml(content: string) {
    const lines = content.split('\n');
    if (lines[0] === '# Changelog') {
      lines.shift();
    }
    while (lines[0] === '') {
      lines.shift();
    }
    let openList = false;
    let newVersion = false;
    return lines
      .map((line) => {
        if (line.startsWith('## ')) {
          let list = '';
          if (openList) {
            openList = false;
            list = '</ul>\n';
          }
          newVersion = true;
          return `${list}<h2>${line.substring(3)}</h2>`;
        } else if (line === '') {
          if (openList) {
            openList = false;
            return '</ul>\n';
          } else if (newVersion) {
            newVersion = false;
            return '';
          } else {
            return '<br>\n';
          }
        } else if (line.startsWith('- ')) {
          newVersion = false;
          let list = '';
          if (!openList) {
            openList = true;
            list = '<ul>';
          }
          return `${list}<li>${line.substring(2)}</li>`;
        } else {
          return line;
        }
      })
      .join('');
  }

  async showChangelog() {
    const response = await fetch('/assets/CHANGELOG.md');
    let content: string;
    if (!response.ok) {
      const currentLog = this.versionInfos()?.changelog;
      if (currentLog) {
        content = `##${this.versionInfos()?.version}\n${currentLog}`;
      } else {
        content = this._i18n.get('noChangeLogAvaliable');
      }
    } else {
      content = await response.text();
    }

    InfoDialogComponent.showHtmlDialog(this._dialog, this.convertChangelogToHtml(content), this._i18n.get('changelog'));
  }
}
