/*
 * Copyright © 2018-2020 ZSO Bern Plus / PCi Fribourg
 *
 * This file is part of Zivilschutzkarte 2.
 *
 * Zivilschutzkarte 2 is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * Zivilschutzkarte 2 is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along with
 * Zivilschutzkarte 2.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 */

import { Component, HostListener, OnInit } from '@angular/core';
import { Layer } from './layer';
import { swissProjection } from '../projections';
import OlTileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import OlTileGridWMTS from 'ol/tilegrid/WMTS';
import OlTileWMTS from 'ol/source/WMTS';
import OlTileXYZ from 'ol/source/XYZ';
import { SharedStateService } from '../shared-state.service';
import { GeoadminService } from '../geoadmin.service';
import { I18NService } from '../i18n.service';
import { MatDialog } from '@angular/material/dialog';
import { MapLegendDisplayComponent } from '../map-legend-display/map-legend-display.component';

const favoriteFeatures = [
  'auengebiete',
  'gemeindegrenzen',
  'gewässer swisstlm3d',
  'hangneigung ab 30°',
  'strassen und wege swisstlm3d'
];

@Component({
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.css'],
})
export class LayersComponent {
  constructor(
    private sharedState: SharedStateService,
    private geoAdminService: GeoadminService,
    public i18n: I18NService,
    public dialog: MatDialog
  ) {}

  currentLayer: Layer = null;

  filterFeatures(feature: any) {
    return (
      feature.value.timestamps === undefined ||
      feature.value.timestamps.size() === 0
    );
  }

  changeToLayer(layer: Layer) {
    this.currentLayer = layer;
    this.sharedState.switchToLayer(layer);
  }

  showLegend(item) {
    this.dialog.open(MapLegendDisplayComponent, {
      data: item.serverLayerName,
    });
  }
}
