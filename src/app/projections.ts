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

import { get } from 'ol/proj';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

proj4.defs(
  'EPSG:2056',
  '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs'
);
register(proj4);

export const coordinatesProjection = getCoordinatesProjection();
export const mercatorProjection = getMercatorProjection();
export const swissProjection = getSwissProjection();

function getCoordinatesProjection() {
  return get('EPSG:4326');
}

function getMercatorProjection() {
  return get('EPSG:3857');
}

function getSwissProjection() {
  const projection = get('EPSG:2056');
  projection.setExtent([2420000, 130000, 2900000, 1350000]);
  const RESOLUTIONS = [
    4000, 3750, 3500, 3250, 3000, 2750, 2500, 2250, 2000, 1750, 1500, 1250,
    1000, 750, 650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1.5, 1, 0.5, 0.25,
    0.1,
  ];
  const matrixIds = [];
  for (let i = 0; i < RESOLUTIONS.length; i++) {
    matrixIds.push(i);
  }
  console.log('disabled');
  // projection.matrixIds = matrixIds;
  // projection.resolutions = RESOLUTIONS;
  return projection;
}
