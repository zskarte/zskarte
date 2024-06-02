import { Component, Inject } from '@angular/core';
import { ZsMapStateService } from 'src/app/state/state.service';
import { I18NService } from '../../../state/i18n.service';
import { WmsSource } from '../../map-layer-interface';
import { WmsService } from '../wms.service';
import { MatSelectChange } from '@angular/material/select';
import { MatRadioChange } from '@angular/material/radio';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-wms-source',
  templateUrl: './wms-source.component.html',
  styleUrl: './wms-source.component.scss',
})
export class WmsSourceComponent {
  selectedSource?: WmsSource;
  fullUrl = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public sources: WmsSource[],
    public mapState: ZsMapStateService,
    public wmsService: WmsService,
    public i18n: I18NService,
  ) {
    //read sources and create local copy from them
    this.sources = [...sources].map((item) => {
      const clone = { ...item };
      if (item.attribution) {
        clone.attribution = item.attribution.map((a) => [...a]);
      }
      return clone;
    });
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
      const newSource: WmsSource = { type: 'wms', url: 'https://', label: '' };
      this.selectedSource = newSource;
      this.sources.push(newSource);
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
    }
  }
}
