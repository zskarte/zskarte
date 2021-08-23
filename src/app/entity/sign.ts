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

export interface FillStyle {
  name: string;
  size?: number;
  angle?: number;
  spacing?: number;
}

export interface Sign {
  type: string;
  src: string;
  protected?: boolean;
  de?: string;
  fr?: string;
  en?: string;
  text?: string;
  label?: string;
  fontSize?: number;
  style?: string;
  fillStyle?: FillStyle;
  example?: string;
  fillOpacity?: number;
  color?: string;
  strokeWidth?: number;
  hideIcon?: boolean;
  iconOffset?: number;
  flipIcon?: boolean;
  topCoord?: number[];
  onlyForSessionId?: string;
  description?: string;
  arrow?: string;
  iconSize?: number;
  images?: string[];
  kat?: string; // deprecated - kept for compatibility reasons (is translated directly to color)
  iconOpacity?: number;
  rotation?: number;
}

export function isMoreOptimalIconCoordinate(
  coordinateToTest,
  currentCoordinate
) {
  if (currentCoordinate === undefined || currentCoordinate === null) {
    return true;
  } else if (coordinateToTest[1] > currentCoordinate[1]) {
    return true;
  } else if (coordinateToTest[1] === currentCoordinate[1]) {
    return coordinateToTest[0] < currentCoordinate[0];
  }
  return false;
}

export function getFirstCoordinate(feature) {
  switch (feature.getGeometry().getType()) {
    case 'Polygon':
    case 'MultiPolygon':
      return feature.getGeometry().getCoordinates()[0][0];
    case 'LineString':
      return feature.getGeometry().getCoordinates()[0];
    case 'Point':
      return feature.getGeometry().getCoordinates();
  }
}

export function getMostTopCoordinate(feature) {
  let symbolAnchorCoordinate = null;
  switch (feature.getGeometry().getType()) {
    case 'Polygon':
    case 'MultiPolygon':
      for (const coordinateGroup of feature.getGeometry().getCoordinates()) {
        for (const coordinate of coordinateGroup) {
          if (isMoreOptimalIconCoordinate(coordinate, symbolAnchorCoordinate)) {
            symbolAnchorCoordinate = coordinate;
          }
        }
      }
      break;
    case 'LineString':
      for (const coordinate of feature.getGeometry().getCoordinates()) {
        if (isMoreOptimalIconCoordinate(coordinate, symbolAnchorCoordinate)) {
          symbolAnchorCoordinate = coordinate;
        }
      }
      break;
    case 'Point':
      symbolAnchorCoordinate = feature.getGeometry().getCoordinates();
      break;
  }
  return symbolAnchorCoordinate;
}

export function defineDefaultValuesForSignature(signature: Sign) {
  if (!signature.style) {
    signature.style = 'solid';
  }
  if (!signature.color) {
    if (signature.kat) {
      switch (signature.kat) {
        case 'blue':
          signature.color = '#0000FF';
          break;
        case 'red':
          signature.color = '#FF0000';
          break;
        case 'orange':
          signature.color = '#FF9100';
          break;
        case 'other':
          signature.color = '#948B68';
          break;
      }
    } else {
      signature.color = '#535353';
    }
  }
  if (!signature.fillOpacity) {
    signature.fillOpacity = 0.2;
  }
  if (!signature.strokeWidth) {
    signature.strokeWidth = 1;
  }
  if (!signature.fontSize) {
    signature.fontSize = 1;
  }
  if (!signature.fillStyle) {
    signature.fillStyle = {
      name: 'filled',
    };
  }
  if (!signature.fillStyle.angle) {
    signature.fillStyle.angle = 45;
  }
  if (!signature.fillStyle.size) {
    signature.fillStyle.size = 4;
  }
  if (!signature.fillStyle.spacing) {
    signature.fillStyle.spacing = 10;
  }
  if (!signature.iconOffset) {
    signature.iconOffset = 0.1;
  }
  if (signature.protected === undefined) {
    signature.protected = false;
  }
  if (!signature.arrow) {
    signature.arrow = 'none';
  }
  if (!signature.iconSize) {
    signature.iconSize = 1;
  }
  if (!signature.images) {
    signature.images = [];
  }
}
