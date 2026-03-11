import { ChangeDetectorRef, Component, OnDestroy, inject, signal } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { I18NService } from 'src/app/state/i18n.service';
import { BehaviorSubject, Subject, firstValueFrom } from 'rxjs';
import { SyncService } from '../../sync/sync.service';
import { SessionService } from '../../session/session.service';
import { ZsMapStateService } from '../../state/state.service';
import { db } from 'src/app/db/db';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from 'src/app/info-dialog/info-dialog.component';
import { BlobEventType, BlobOperation, BlobService } from 'src/app/db/blob.service';
import { LOCAL_MAP_STYLE_PATH, LOCAL_MAP_STYLE_SOURCE } from 'src/app/session/default-map-values';
import { MapLayerService } from 'src/app/map-layer/map-layer.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ZsMapStateSource, GeoJSONMapLayer, zsMapStateSourceToDownloadUrl, MapLayer } from '@zskarte/types';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { OfflineService } from '../../db/offline-service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sidebar-connections',
  templateUrl: './sidebar-connections.component.html',
  styleUrls: ['./sidebar-connections.component.scss'],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    FormsModule,
    MatIconModule,
    MatListModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatExpansionModule,
    CommonModule,
  ],
})
export class SidebarConnectionsComponent implements OnDestroy {
  i18n = inject(I18NService);
  private syncService = inject(SyncService);
  session = inject(SessionService);
  state = inject(ZsMapStateService);
  private _dialog = inject(MatDialog);
  private cdRef = inject(ChangeDetectorRef);
  offlineService = inject(OfflineService);

  readonly connections = toSignal(this.syncService.observeConnections());
  readonly label = signal('');
  showCurrentLocation = toSignal(this.state.observeShowCurrentLocation$());
  labelEdit = false;
  public isOnline = new BehaviorSubject<boolean>(true);
  mapProgress = 0;

  constructor() {
    this.label.set(this.session.getLabel() ?? '');

    this.offlineService.setUpdateMapCallbacks('sidebar', this.updateMapCallback.bind(this));
  }

  ngOnDestroy(): void {
    this.offlineService.setUpdateMapCallbacks('sidebar', null);
  }

  public toggleEditLabel(): void {
    this.labelEdit = !this.labelEdit;
    if (this.labelEdit) return;
    this.session.setLabel(this.label());
  }

  public centerMap(location: { long: number; lat: number }): void {
    this.state.updateCurrentMapCenter$([location.long, location.lat]);
  }

  private async updateMapCallback(eventType: BlobEventType, infos: BlobOperation) {
    this.mapProgress = infos.mapProgress;
    this.cdRef.detectChanges();
  }

  async prepareLocalAvailability() {
    await this.offlineService.prepareLocalAvailability();
  }

  showSearchInfo(event) {
    event.preventDefault();
    InfoDialogComponent.showTextDialog(this._dialog, this.i18n.get('howtoFindSearchCapability'), this.i18n.get('info'));
  }
}
