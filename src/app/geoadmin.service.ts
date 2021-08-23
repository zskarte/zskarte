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

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { I18NService } from './i18n.service';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';

@Injectable({
  providedIn: 'root',
})
export class GeoadminService {
  constructor(private http: HttpClient, public i18n: I18NService) {}

  getFeatures(): any {
    return this.http.get(
      'https://api3.geo.admin.ch/rest/services/api/MapServer/layersConfig?lang=' +
        this.i18n.locale
    );
  }

  getLegend(layerId: string): any {
    return this.http.get(
      'https://api3.geo.admin.ch/rest/services/api/MapServer/' +
        layerId +
        '/legend?lang=' +
        this.i18n.locale,
      { responseType: 'text' }
    );
  }

  queryPolygons(
    layerId: string,
    searchField: string,
    searchText: string
  ): Promise<any[]> {
    return new Promise((resolve) =>
      this.http
        .get(
          'https://api3.geo.admin.ch/rest/services/api/MapServer/find?layer=' +
            layerId +
            '&searchField=' +
            searchField +
            '&searchText=' +
            searchText +
            '&geometryFormat=geojson&sr=3857'
        )
        .subscribe((data) => {
          if (data && data['results']) {
            const features = [];
            for (const r of data['results']) {
              const geometry = r['geometry'];
              if (geometry['type'] && geometry['type'] === 'MultiPolygon') {
                const coordinates = geometry['coordinates'];
                const flatCoordinates = [];
                for (const polygon of coordinates) {
                  for (const polygonCoordinates of polygon) {
                    flatCoordinates.push(polygonCoordinates);
                  }
                }
                const feature = {
                  type: 'Feature',
                  geometry: { type: 'Polygon', coordinates: flatCoordinates },
                  properties: {
                    sig: {
                      type: 'Polygon',
                      src: null,
                      label: r.properties.label,
                    },
                    zindex: 0,
                  },
                };
                features.push(feature);
              }
            }
            resolve(features);
          }
        })
    );
  }
}
