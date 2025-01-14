import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { I18NService } from '../../../state/i18n.service';
import { CsvMapLayer, WmsSource } from '@zskarte/types';
import { ZsMapStateService } from '../../../state/state.service';
import { GeoJSONService } from '../geojson.service';
import { Extent } from 'ol/extent';
import { FormsModule, NgModel } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { RegexValidatorDirective } from '../../regex-validator.directive';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-geojson-layer-options',
  templateUrl: './geojson-layer-options.component.html',
  styleUrl: './geojson-layer-options.component.scss',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatRadioGroup,
    MatRadioButton,
    FormsModule,
    MatIconModule,
    RegexValidatorDirective,
    MatCheckboxModule,
  ],
})
export class GeoJSONLayerOptionsComponent {
  layer = inject<CsvMapLayer>(MAT_DIALOG_DATA);
  dialogRef = inject<MatDialogRef<GeoJSONLayerOptionsComponent>>(MatDialogRef);
  i18n = inject(I18NService);
  mapState = inject(ZsMapStateService);
  private geoJSONService = inject(GeoJSONService);

  sourceUrl = '';
  lastExtent: Extent = [0, 0, 0, 0];
  constructor() {
    let layer = this.layer;

    this.layer = layer = { ...layer };
    if (layer.attribution) {
      layer.attribution = layer.attribution.map((a) => [...a]);
    }
    if (layer.searchRegExPatterns) {
      layer.searchRegExPatterns = layer.searchRegExPatterns.map((a) => [...a]);
    }
    if (layer.searchResultGroupingFilterFields) {
      layer.searchResultGroupingFilterFields = [...layer.searchResultGroupingFilterFields];
    }
    if (layer.filterRegExPattern) {
      layer.filterRegExPattern = layer.filterRegExPattern.map((a) => [...a]);
    }
    if (layer.extent) {
      layer.extent = [...layer.extent];
    }

    if (this.layer.source) {
      this.sourceUrl = this.layer.source.url;
    }
    if (this.layer.styleSourceType === undefined) {
      this.layer.styleSourceType = 'url';
    }
    if (this.layer.styleFormat === undefined) {
      this.layer.styleFormat = 'mapbox';
    }
    if (this.layer.searchable === undefined) {
      this.layer.searchable = false;
    }
  }

  toggleExtent(newVal: boolean) {
    if (newVal) {
      this.layer.extent = this.lastExtent;
    } else {
      if (this.layer.extent) {
        this.lastExtent = this.layer.extent;
      }
      this.layer.extent = undefined;
    }
  }

  removeFilterPattern(index: number) {
    if (this.layer?.filterRegExPattern && this.layer.filterRegExPattern.length > index) {
      this.layer.filterRegExPattern.splice(index, 1);
    }
  }

  addFilterPattern() {
    if (this.layer) {
      if (!this.layer.filterRegExPattern) {
        this.layer.filterRegExPattern = [];
      }
      this.layer.filterRegExPattern.push(['', '', '']);
    }
  }

  removePattern(index: number) {
    if (this.layer?.searchRegExPatterns && this.layer.searchRegExPatterns.length > index) {
      this.layer.searchRegExPatterns.splice(index, 1);
    }
  }

  addPattern() {
    if (this.layer) {
      if (!this.layer.searchRegExPatterns) {
        this.layer.searchRegExPatterns = [];
      }
      this.layer.searchRegExPatterns.push(['', 'u']);
    }
  }

  // skipcq:  JS-0105
  deferredRevalidate(validInfo: NgModel) {
    setTimeout(() => validInfo.control.updateValueAndValidity(), 250);
  }

  removeField(index: number) {
    if (this.layer?.searchResultGroupingFilterFields && this.layer.searchResultGroupingFilterFields.length > index) {
      this.layer.searchResultGroupingFilterFields.splice(index, 1);
    }
  }

  addField() {
    if (this.layer) {
      if (!this.layer.searchResultGroupingFilterFields) {
        this.layer.searchResultGroupingFilterFields = [];
      }
      this.layer.searchResultGroupingFilterFields.push('');
    }
  }

  removeAttribution(index: number) {
    if (this.layer?.attribution && this.layer.attribution.length > index) {
      this.layer.attribution.splice(index, 1);
    }
  }

  addAttribution() {
    if (this.layer) {
      if (!this.layer.attribution) {
        this.layer.attribution = [];
      }
      this.layer.attribution.push(['', '']);
    }
  }

  ok() {
    if (!this.layer.searchable) {
      delete this.layer.searchable;
    }
    this.layer.source = { url: this.sourceUrl } as WmsSource;
    if (this.layer.source?.url) {
      this.geoJSONService.invalidateCache(this.layer.source.url);
    }
    this.dialogRef.close(this.layer);
  }
}
