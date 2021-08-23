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

import { Viewport } from './viewport';

export interface ZSO {
  id: string;
  name: string;
  auth: string;
  url: string;
  initialViewPort: Viewport;
  defaultLocale: string;
}

export function getZSOById(zsoId: string): ZSO {
  for (const z of LIST_OF_ZSO) {
    if (zsoId === z.id) {
      return z;
    }
  }
  return null;
}

export const ZSGUEST: ZSO = {
  id: 'zso_guest',
  name: 'Gast (1h)',
  auth: '',
  initialViewPort: { coordinates: [828447.13, 5933355.81], zoomLevel: 16 },
  url: 'https://zskarte.ch/',
  defaultLocale: 'de',
};

export const ZSBERN_PLUS: ZSO = {
  id: 'zso_be_bp',
  name: 'ZSO Bern Plus',
  auth: '48c8a0ae3e192e2eec155e0c2bc02f02',
  initialViewPort: {
    coordinates: [829038.2228723184, 5933590.521128002],
    zoomLevel: 16,
  },
  url: 'http://www.zso-bern-plus.ch/',
  defaultLocale: 'de',
};

export const ZSFRIBOURG: ZSO = {
  id: 'zso_fr_pcif',
  name: 'PCi Fribourgeoise',
  auth: 'f567e31a75e3e413e018e96b6ea80ac8',
  initialViewPort: {
    coordinates: [784702.5323756159, 5912939.19705637],
    zoomLevel: 10,
  },
  url: 'https://www.pci-fr.ch/pcf/',
  defaultLocale: 'fr',
};

export const ZSRA: ZSO = {
  id: 'zso_be_zsra',
  name: 'ZS Region Aarberg',
  auth: '28694ea6267e914855e3488d0b4e6827',
  initialViewPort: { coordinates: [813362.88, 5954168.67], zoomLevel: 16 },
  url: 'https://www.zsra.ch/',
  defaultLocale: 'de',
};

export const ZSOTP: ZSO = {
  id: 'zso_be_tp',
  name: 'ZSO Thun plus',
  auth: 'd8becf30d11b55b35068f7119bbe6ef0',
  initialViewPort: { coordinates: [849143.74, 5902660.63], zoomLevel: 16 },
  url: 'https://www.zsothunplus.ch/',
  defaultLocale: 'de',
};

export const ZSOSZ: ZSO = {
  id: 'zso_be_sz',
  name: 'ZSO Steffisburg-Zulg',
  auth: '5e209578d1d35e83ef2a9689fffd798b',
  initialViewPort: { coordinates: [849861.97, 5905812.55], zoomLevel: 16 },
  url: 'http://www.steffisburg.ch/de/verwaltung/abteilungen/62_zivilschutz-steffisburg-zulg',
  defaultLocale: 'de',
};

export const LIST_OF_ZSO: ZSO[] = [ZSGUEST, ZSRA, ZSOTP, ZSOSZ];
