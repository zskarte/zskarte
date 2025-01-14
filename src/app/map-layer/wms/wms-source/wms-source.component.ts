import { Component, inject } from '@angular/core';
import { ZsMapStateService } from 'src/app/state/state.service';
import { I18NService } from '../../../state/i18n.service';
import { WmsSource } from '../../map-layer-interface';
import { WmsService } from '../wms.service';
import { BehaviorSubject } from 'rxjs';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-wms-source',
  templateUrl: './wms-source.component.html',
  styleUrl: './wms-source.component.scss',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    AsyncPipe,
    FormsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatIconModule,
    MatDialogClose,
  ],
})
export class WmsSourceComponent {
  sources = inject(MAT_DIALOG_DATA);
  mapState = inject(ZsMapStateService);
  wmsService = inject(WmsService);
  i18n = inject(I18NService);

  selectedSource?: WmsSource;
  fullUrl = '';
  selectGlobalSourceMode = false;
  globalSources: WmsSource[];
  globalSource?: WmsSource;
  filteredGlobalSources$: BehaviorSubject<WmsSource[]>;
  constructor() {
    const sources = this.sources;
    const mapState = this.mapState;

    this.globalSources = mapState.getGlobalWmsSources();
    this.filteredGlobalSources$ = new BehaviorSubject(this.globalSources);
    //read sources and create local copy from them
    this.sources = [...sources].map((item) => {
      const clone = { ...item };
      if (item.attribution) {
        clone.attribution = item.attribution.map((a) => [...a]);
      }
      return clone;
    });
    const sourceIds = this.sources.map((s) => s.id);
    this.filteredGlobalSources$.next(this.globalSources.filter((s) => !s.id || !sourceIds.includes(s.id)));
  }

  updateFullUrl($event: MatRadioChange | Event | null) {
    if (this.selectedSource) {
      if (this.selectedSource.url === 'https://') {
        return;
      }
      if ($event) {
        this.wmsService.invalidateCache(this.selectedSource.url);
      }
      if (this.selectedSource.type === 'wmts') {
        this.fullUrl = WmsService.getfullWMTSCapaUrl(this.selectedSource.url).toString();
      } else if (this.selectedSource.type === 'wms') {
        this.fullUrl = WmsService.getfullWMSCapaUrl(this.selectedSource.url).toString();
      }
    }
  }

  removeAttribution(index: number) {
    if (this.selectedSource?.attribution && this.selectedSource.attribution.length > index) {
      this.selectedSource.attribution.splice(index, 1);
    }
  }

  addAttribution() {
    if (this.selectedSource) {
      if (!this.selectedSource.attribution) {
        this.selectedSource.attribution = [];
      }
      this.selectedSource.attribution.push(['', '']);
    }
  }

  onSelectionChange($event: MatSelectChange) {
    if ($event.value === '__NEW__') {
      const newSource: WmsSource = { type: 'wms', url: 'https://', label: '', owner: true, public: false };
      this.selectedSource = newSource;
      this.sources.push(newSource);
    } else if ($event.value === '__SELECT__') {
      this.selectedSource = undefined;
      this.selectGlobalSourceMode = true;
    } else if ($event.value) {
      this.selectedSource = $event.value;
      this.updateFullUrl(null);
    }
  }

  removeSource() {
    const index = this.sources.findIndex((o) => o === this.selectedSource) ?? -1;
    if (index !== -1) {
      this.sources.splice(index, 1);
      this.selectedSource = undefined;
      this.fullUrl = '';

      const sourceIds = this.sources.map((s) => s.id);
      this.filteredGlobalSources$.next(this.globalSources.filter((s) => !s.id || !sourceIds.includes(s.id)));
    }
  }

  addSource() {
    if (this.globalSource) {
      this.selectGlobalSourceMode = false;
      this.sources.push(this.globalSource);
      this.selectedSource = this.globalSource;
      this.updateFullUrl(null);
      this.globalSource = undefined;

      const sourceIds = this.sources.map((s) => s.id);
      this.filteredGlobalSources$.next(this.globalSources.filter((s) => !s.id || !sourceIds.includes(s.id)));
    }
  }
}
