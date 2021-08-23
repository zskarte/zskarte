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

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GeoadminService } from '../geoadmin.service';
import { I18NService } from '../i18n.service';

@Component({
  selector: 'app-map-legend-display',
  templateUrl: './map-legend-display.component.html',
  styleUrls: ['./map-legend-display.component.css'],
})
export class MapLegendDisplayComponent {
  html: string = null;
  constructor(
    public dialogRef: MatDialogRef<MapLegendDisplayComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
    private geoAdmin: GeoadminService,
    public i18n: I18NService
  ) {
    if (data) {
      geoAdmin.getLegend(data).subscribe((data) => {
        this.html = data;
      });
    } else {
      this.html = this.i18n.get('legendNotLoaded');
    }
  }
}
