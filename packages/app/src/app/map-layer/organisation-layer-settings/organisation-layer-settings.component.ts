import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { I18NService } from '../../state/i18n.service';
import { MapLayerService } from '../map-layer.service';
import { IZsMapOrganization, IZsMapOrganizationMapLayerSettings, MapLayer, WmsSource } from '@zskarte/types';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, combineLatest, map, startWith } from 'rxjs';
import { getPropertyDifferences } from 'src/app/helper/diff';
import { LocalMapLayer } from 'src/app/db/db';
import { MatActionList, MatListModule, MatListOption, MatSelectionList } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-organisation-layer-settings',
  templateUrl: './organisation-layer-settings.component.html',
  styleUrl: './organisation-layer-settings.component.scss',
  imports: [
    MatSelectionList,
    MatListOption,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDialogClose,
    MatActionList,
    MatListModule,
    AsyncPipe,
    MatButtonModule,
    MatListModule,
    MatExpansionModule,
    MatDialogModule,
  ],
})
export class OrganisationLayerSettingsComponent {
  data = inject<{
    organization?: IZsMapOrganization;
    localMapLayerSettings?: IZsMapOrganizationMapLayerSettings;
    wmsSources: WmsSource[];
    globalMapLayers: MapLayer[];
    allLayers: MapLayer[];
    selectedLayers: MapLayer[];
    selectedSources: WmsSource[];
  }>(MAT_DIALOG_DATA);
  private dialogRef = inject<MatDialogRef<OrganisationLayerSettingsComponent>>(MatDialogRef);
  private _mapLayerService = inject(MapLayerService);
  i18n = inject(I18NService);

  wms_sources: number[];
  layer_favorites: MapLayer[];

  layerFilter = new FormControl('');
  sourceFilter = new FormControl('ALL');
  filteredAvailableLayers$: Observable<MapLayer[]>;
  constructor() {
    const data = this.data;

    if (data.organization) {
      this.wms_sources = [...data.organization.wms_sources];
      this.layer_favorites = data.allLayers.filter((f) => f.id && data.organization?.map_layer_favorites.includes(f.id));
    } else if (data.localMapLayerSettings) {
      this.wms_sources = [...(data.localMapLayerSettings.wms_sources ?? [])];
      this.layer_favorites = data.allLayers.filter((f) => f.id && data.localMapLayerSettings?.map_layer_favorites?.includes(f.id));
    } else {
      this.wms_sources = [];
      this.layer_favorites = [];
    }

    const filter$ = this.layerFilter.valueChanges.pipe(startWith(''));
    const selectedSource$ = this.sourceFilter.valueChanges.pipe(startWith('ALL'));

    this.filteredAvailableLayers$ = combineLatest([filter$, selectedSource$]).pipe(
      map(([filter, source]) => {
        let layers = data.allLayers.sort((a: MapLayer, b: MapLayer) => a.label.localeCompare(b.label));
        if (source !== 'ALL') {
          if (source === '_GlobalMapLayers_') {
            layers = layers.filter((f) => f.id !== undefined);
          } else {
            const sourceFilter = source === '_GeoAdmin_' ? undefined : source;
            layers = layers.filter((f) => f.source?.url === sourceFilter);
          }
        }
        return filter === '' ? layers : layers.filter((f) => f.label.toLowerCase().includes(filter?.toLowerCase() ?? ''));
      }),
    );
  }

  toggleSource(item: WmsSource) {
    const id = item.id;
    if (id) {
      const index = this.wms_sources.indexOf(id);
      if (index !== -1) {
        this.wms_sources.splice(index, 1);
      } else {
        this.wms_sources.push(id);
      }
    }
  }

  selectCurrentSource() {
    this.wms_sources = this.data.selectedSources.map((s) => s.id ?? null).filter((id): id is number => Boolean(id));
  }

  removeLayer(layer: MapLayer) {
    const index = this.layer_favorites.indexOf(layer);
    if (index !== -1) {
      this.layer_favorites.splice(index, 1);
    }
  }

  addCurrentLayers() {
    this.data.selectedLayers.forEach((layer) => this.selectLayer(layer));
  }

  selectLayer(layer: MapLayer) {
    const index = this.layer_favorites.indexOf(layer);
    if (index === -1) {
      let existing = this.layer_favorites.find((f) => f.id === layer.id);
      if (!existing) {
        existing = this.layer_favorites.find((f) => f.fullId === layer.fullId);
      }
      if (existing && OrganisationLayerSettingsComponent.sameOptions(existing, layer)) {
        return;
      }
      this.layer_favorites.push(layer);
    }
  }

  changedOptions(layer: MapLayer) {
    const defaultLayer = this.data.allLayers.find((f) => f.fullId === layer.fullId);
    return !defaultLayer || !OrganisationLayerSettingsComponent.sameOptions(defaultLayer, layer);
  }

  static sameOptions(oldLayer: MapLayer, newLayer: MapLayer, ignoreFields: string[] = []) {
    if (!oldLayer || !newLayer) {
      return false;
    }
    const diff = getPropertyDifferences(oldLayer, newLayer);
    delete diff.deleted;
    delete diff.zIndex;
    delete diff.fullId;
    delete diff.owner;
    // skipcq: JS-0320
    ignoreFields.forEach((field) => delete diff[field]);
    return Object.keys(diff).length === 0;
  }

  private updateSelectedLayer(selectedLayer: LocalMapLayer | undefined, savedLayer: LocalMapLayer) {
    // if it was one of the selected one, update the changed values
    if (selectedLayer) {
      const index = this.data.selectedLayers.indexOf(selectedLayer);
      selectedLayer = {
        ...selectedLayer,
        id: savedLayer.id,
        fullId: savedLayer.fullId,
        owner: savedLayer.owner,
        public: savedLayer.public,
        offlineAvailable: savedLayer.offlineAvailable,
        sourceBlobId: savedLayer.sourceBlobId,
        styleBlobId: savedLayer.styleBlobId,
      };
      this.data.selectedLayers[index] = selectedLayer;
    }
  }

  async ok() {
    const map_layer_favorites: number[] = [];
    const errors: string[] = [];
    for (let i = 0; i < this.layer_favorites.length; i++) {
      const layer = { ...this.layer_favorites[i] };
      // check if matching entry in selectedLayers and the values are the same / it's relay added from there
      const selectedLayer = this.data.selectedLayers.find(
        (g) => g.fullId === layer.fullId && OrganisationLayerSettingsComponent.sameOptions(g, layer),
      );
      if (layer.id) {
        const defaultLayer = this.data.allLayers.find((g) => g.fullId === layer.fullId);
        if (defaultLayer) {
          if (OrganisationLayerSettingsComponent.sameOptions(defaultLayer, layer, ['sourceBlobId', 'styleBlobId', 'offlineAvailable'])) {
            // unchaged existing globalMapLayer, add it
            map_layer_favorites.push(layer.id);
            if (!this.data.organization) {
              // if it's local mode make sure layer is saved locally
              await this._mapLayerService.saveLocalMapLayer(layer);
              this.updateSelectedLayer(selectedLayer, layer);
            }
            continue;
          } else {
            // layer settings are changed
            if (layer.owner) {
              // skipcq: JS-0052
              const override = window.confirm(this.i18n.get('askReplaceExistingLayerSettings').replace('{0}', layer.label));
              if (!override) {
                // keep old, create new
                delete layer.id;
              }
            } else {
              // not owner, create new
              layer.public = false;
              delete layer.id;
            }
          }
        } else {
          // unknown old values, create new
          delete layer.id;
        }
      }
      // for the new generated layer you'r the owner
      layer.owner = true;
      const savedLayer = await this._mapLayerService.saveGlobalMapLayer(layer, this.data.organization?.documentId);
      if (savedLayer?.id) {
        this.layer_favorites[i] = savedLayer;
        // add new added layer
        map_layer_favorites.push(savedLayer.id);
        this.updateSelectedLayer(selectedLayer, savedLayer);
      } else {
        errors.push(`Error on persist ${layer.label}`);
      }
    }
    if (errors.length > 0) {
      // skipcq: JS-0052
      alert(errors.join('\n'));
      return;
    }
    if (!this.data.organization) {
      // if it's local mode make sure wms sources are saved locally
      for (const wmsSoruce of this.data.wmsSources) {
        await MapLayerService.saveLocalWmsSource(wmsSoruce);
      }
    }
    this.dialogRef.close({ wms_sources: this.wms_sources, map_layer_favorites });
  }
}
