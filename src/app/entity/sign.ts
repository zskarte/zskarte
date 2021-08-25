export interface FillStyle {
  name: string;
  size?: number;
  angle?: number;
  spacing?: number;
}

export interface Sign {
  id?: number;
  type: string;
  src: string;
  kat?: string;
  size?: string;
  protected?: boolean;
  de?: string;
  fr?: string;
  en?: string;
  text?: string;
  label?: string;
  labelShow?: boolean;
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
  iconOpacity?: number;
  rotation?: number;
  filterValue?: string;
  origSrc?: string;
  createdAt?: Date;
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

export function getLastCoordinate(feature) {
  const coordinates = feature.getGeometry().getCoordinates();

  switch (feature.getGeometry().getType()) {
    case 'Polygon':
    case 'MultiPolygon':
      return coordinates[coordinates.length - 2][0]; // -2 because the last coordinates are the same as the first
    case 'LineString':
      return coordinates[coordinates.length - 1];
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


export const signCategories = [
  {
    'name': 'place',
    'color': '#0000FF'
  },
  {
    'name': 'formations',
    'color': '#0000FF'
  },
  {
    'name': 'actions',
    'color': '#0000FF'
  },
  {
    'name': 'damage',
    'color': '#FF0000'
  },
  {
    'name': 'dangers',
    'color': '#FF9100'
  },
  {
    'name': 'fks',
    'color': '#B22CC6'
  },
  {
    'name': 'effects',
    'color': '#948B68'
  },
  {
    'name': 'labels',
    'color': '#555555'
  }
  ];

export function getColorForCategory(kat: string) : string {
  switch (kat) {
    case 'blue':
    case 'place':
    case 'means':
    case 'formations':
      return '#0000FF';
      break;
    case 'red':
    case 'damage':
      return '#FF0000';
      break;
    case 'orange':
    case 'dangers':
      return '#FF9100';
      break;
    case 'other':
    case 'fks':
    case 'effects':
    case 'labels':
      return '#948B68';
      break;
  }
}

export function defineDefaultValuesForSignature(signature: Sign) {
  if (!signature.style) {
    signature.style = 'solid';
  }
  if (!signature.size) {
    signature.size = undefined;
  }
  if (!signature.color) {
    if (signature.kat) {
      signature.color = getColorForCategory(signature.kat);
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
  if (signature.labelShow === undefined) {
    signature.labelShow = true;
  }
  if (!signature.arrow) {
    signature.arrow = 'none';
  }
  if (!signature.iconSize) {
    signature.iconSize = 1;
  }
  if (!signature.iconOpacity) {
    signature.iconOpacity = 1;
  }
  if (!signature.rotation) {
    signature.rotation = 1;
  }
  if (!signature.images) {
    signature.images = [];
  }
}
