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
import { I18NService } from '../i18n.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-coordinates',
  templateUrl: './edit-coordinates.component.html',
  styleUrls: ['./edit-coordinates.component.css'],
})
export class EditCoordinatesComponent {
  coordinates: string;
  geometry: string;
  error: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: object,
    public i18n: I18NService,
    public dialogRef: MatDialogRef<EditCoordinatesComponent>
  ) {
    // @ts-ignore
    this.geometry = data.geometry;
    // @ts-ignore
    this.coordinates = data.coordinates;
  }

  cancel() {
    this.dialogRef.close(null);
  }

  ok(): void {
    let parsedCoordinates;
    try {
      parsedCoordinates = JSON.parse(this.coordinates);
    } catch (e) {
      this.error = 'Invalid JSON payload';
    }
    if (parsedCoordinates) {
      let valid = true;
      switch (this.geometry) {
        case 'Point':
          valid = this.isValidPointCoordinate(parsedCoordinates);
          break;
        case 'LineString':
          valid = this.isValidLine(parsedCoordinates);
          break;
        case 'Polygon':
        case 'MultiPolygon':
          valid = this.isValidPolygon(parsedCoordinates);
          break;
      }
      if (valid) {
        this.dialogRef.close(parsedCoordinates);
      } else {
        this.error = 'Invalid coordinates';
      }
    }
  }

  private isValidPointCoordinate(coordinates) {
    return (
      Array.isArray(coordinates) &&
      coordinates.length === 2 &&
      coordinates.filter((c) => typeof c !== 'number').length === 0
    );
  }

  private isValidLine(coordinates) {
    return (
      Array.isArray(coordinates) &&
      coordinates.length > 1 &&
      coordinates.filter((c) => !this.isValidPointCoordinate(c)).length === 0
    );
  }

  private isValidPolygon(coordinates) {
    return (
      Array.isArray(coordinates) &&
      coordinates.length > 0 &&
      coordinates.filter(
        (coordinateGroup) =>
          !Array.isArray(coordinateGroup) ||
          coordinateGroup.length < 3 ||
          coordinateGroup.filter((c) => !this.isValidPointCoordinate(c))
            .length > 0
      ).length == 0
    );
  }
}
