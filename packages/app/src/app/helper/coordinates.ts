import { Coordinate } from 'ol/coordinate';
import { Geometry } from 'ol/geom';
import { getArea, getLength } from 'ol/sphere';

export const areCoordinatesEqual = (
  c1: undefined | null | number | number[] | number[][] | Coordinate,
  c2: undefined | null | number | number[] | number[][] | Coordinate,
): boolean => {
  if (typeof c1 !== typeof c2) {
    return false;
  }
  if (Array.isArray(c1) && Array.isArray(c2)) {
    if (c1.length !== c2.length) {
      return false;
    }
    let isArrayEqual = true;
    for (let i = 0; i < c1.length; i++) {
      if (!areCoordinatesEqual(c1[i], c2[i])) {
        isArrayEqual = false;
      }
    }
    return isArrayEqual;
  }
  return c1 === c2;
};

export const removeCoordinates = (
  data: undefined | null | number[] | number[][] | Coordinate,
  toRemove: undefined | null | number[] | number[][] | Coordinate,
): number[] | number[][] | Coordinate => {
  if (Array.isArray(data?.[0])) {
    // If data is a 2D array, filter out the matching sub-array
    return (data as number[][])
      .map((subArray) => {
        return removeCoordinates(subArray, toRemove) as number[];
      })
      .filter((subArray) => subArray.length > 0);
  } else {
    // If data is a 1D array, filter out the matching value array
    return areCoordinatesEqual(data as number[], toRemove) ? [] : data || [];
  }
};

export function formatLength(line: Geometry): string {
  const length = getLength(line);
  let output: string;
  if (length > 100) {
    output = `${Math.round((length / 1000) * 100) / 100} km`;
  } else {
    output = `${Math.round(length * 100) / 100} m`;
  }
  return output;
}

export function formatArea(polygon: Geometry): string {
  const area = getArea(polygon);
  let output: string;
  if (area > 10000) {
    output = `${Math.round((area / 1000000) * 100) / 100} km<sup>2</sup>`;
  } else {
    output = `${Math.round(area * 100) / 100} m<sup>2</sup>`;
  }
  return output;
}

export function indexOfPointInCoordinateGroup(coordinateGroup: number[][], compareCoordinate: number[]) {
  for (let i = 0; i < coordinateGroup.length; i++) {
    const coordinate = coordinateGroup[i];
    if (coordinate[0] === compareCoordinate[0] && coordinate[1] === compareCoordinate[1]) {
      return i;
    }
  }
  return -1;
}
