import { Component, Inject, OnInit } from '@angular/core';
import { MapStoreService } from '../map-store.service';
import { SharedStateService } from '../shared-state.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { I18NService } from '../i18n.service';
import { DomSanitizer } from '@angular/platform-browser';
import GeoJSON from 'ol/format/GeoJSON';
import { CustomImageStoreService } from '../custom-image-store.service';

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.css'],
})
export class ExportDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: GeoJSON,
    private mapStore: MapStoreService,
    private sharedState: SharedStateService,
    public dialogRef: MatDialogRef<ExportDialogComponent>,
    public i18n: I18NService,
    private sanitizer: DomSanitizer,
    private imageStore: CustomImageStoreService
  ) {}

  withHistory = 'withHistory';
  history = null;
  images = null;
  errorMessage = null;
  downloadData = null;
  downloadTime: string = new Date().toISOString();

  ngOnInit(): void {
    if (this.data) {
      if (this.sharedState.getCurrentSession()) {
        this.mapStore
          .getHistory(this.sharedState.getCurrentSession().uuid)
          .then((history) => {
            this.history = history;
          });
      } else {
        this.errorMessage = 'Was not able to find a valid session';
      }
    } else {
      this.errorMessage = 'Was not able to serialize current map';
    }
  }

  getDownloadFileName() {
    return (
      'zskarte_' +
      this.sharedState.getCurrentSession().uuid +
      '_' +
      this.downloadTime +
      '.zsjson'
    );
  }

  exportSession(): void {
    this.downloadTime = new Date().toISOString();
    const result = this.data;
    result.session = this.sharedState.getCurrentSession();
    result.images = this.imageStore.getAllEntriesForCurrentSession();
    if (this.withHistory === 'withHistory') {
      result.history = this.history;
    }
    const dataUrl =
      'data:text/json;charset=UTF-8,' +
      encodeURIComponent(JSON.stringify(result));
    this.downloadData = this.sanitizer.bypassSecurityTrustUrl(dataUrl);
    if (this.withHistory === 'withHistory') {
      delete result['history'];
    }
    delete result['session'];
  }
}
