export const MapLayerTypes = {
  WMS: 'wms',
  WMS_CUSTOM: 'wms_custom',
  WMTS: 'wmts',
  AGGREGATED: 'aggregate',
  GEOJSON: 'geojson',
  CSV: 'csv',
} as const;
export type MapLayerType = (typeof MapLayerTypes)[keyof typeof MapLayerTypes];