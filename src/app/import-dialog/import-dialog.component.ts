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

import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { I18NService } from '../i18n.service';
import { GeoadminService } from '../geoadmin.service';

@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.css'],
})
export class ImportDialogComponent {
  @ViewChild('fileInput', { static: false }) el: ElementRef;

  geoadminLayer;
  geoadminKey;
  geoadminValue;
  replace: boolean;

  constructor(
    public dialogRef: MatDialogRef<ImportDialogComponent>,
    public i18n: I18NService,
    private geoadminService: GeoadminService
  ) {}

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  readFromFile() {
    const reader = new FileReader();
    for (let index = 0; index < this.el.nativeElement.files.length; index++) {
      reader.onload = () => {
        // this 'text' is the content of the file
        const text = reader.result;
        this.dialogRef.close({ replace: this.replace, value: text });
      };
      reader.readAsText(this.el.nativeElement.files[index], 'UTF-8');
    }
  }

  importFromGeoadmin() {
    this.geoadminService
      .queryPolygons(this.geoadminLayer, this.geoadminKey, this.geoadminValue)
      .then((features) => {
        const featureWrapper = {
          type: 'FeatureCollection',
          features: features,
        };
        this.dialogRef.close({
          replace: this.replace,
          value: JSON.stringify(featureWrapper),
        });
      });
  }
}
