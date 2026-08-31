import { Core } from '@strapi/strapi';
import { MapLayer, MapLayerType, MapLayerTypes } from '../definitions';
import { fileTypeFromFile } from 'file-type';
import { join, basename } from 'node:path';
import { stat, unlink, writeFile } from 'node:fs/promises';
import { DateTimeValue } from '@strapi/types/dist/schema/attribute';
import AdmZip from 'adm-zip';
//need to use v4 of shpjs, as on newer version it forces cjs (require) to a browser version with have self in coding...
import shp from 'shpjs';
import proj4 from 'proj4';
import type { FeatureCollection, Feature, Polygon, MultiPolygon } from 'geojson';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import bbox from '@turf/bbox';
import { BBox } from 'geojson';
import booleanWithin from '@turf/boolean-within';
import booleanDisjoint from '@turf/boolean-disjoint';
import booleanIntersects from '@turf/boolean-intersects';
import intersect from '@turf/intersect';
import buffer from '@turf/buffer';
import area from '@turf/area';
import { Units } from '@turf/helpers';
import { inferSchema, initParser } from 'udsv';
import { writeToString } from '@fast-csv/format';
import { Worker } from 'node:worker_threads';
import { existsSync } from 'node:fs';

proj4.defs(
  'EPSG:2056',
  '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs',
);

//mappings for canton to shape name in SwissBoundaries
const CANTON_NAMES = {
  AG: 'Aargau',
  AI: 'Appenzell Ausserrhoden',
  AR: 'Appenzell Innerrhoden',
  BE: 'Bern',
  BL: 'Basel-Landschaft',
  BS: 'Basel-Stadt',
  FR: 'Fribourg',
  GE: 'Genève',
  GL: 'Glarus',
  GR: 'Graubünden',
  JU: 'Jura',
  LU: 'Luzern',
  NE: 'Neuchâtel',
  NW: 'Nidwalden',
  OW: 'Obwalden',
  SG: 'St. Gallen',
  SH: 'Schaffhausen',
  SO: 'Solothurn',
  SZ: 'Schwyz',
  TG: 'Thurgau',
  TI: 'Ticino',
  UR: 'Uri',
  VD: 'Vaud',
  VS: 'Valais',
  ZG: 'Zug',
  ZH: 'Zürich',
};

const swissNAMES3D_fieldX = 'E';
const swissNAMES3D_fieldY = 'N';

const ENTRANCE_NEED_SPLIT_SIZE = 25_000_000;
const ENTRANCE_TO_BIG_SIZE = 50_000_000;

interface Folder {
  id: number | string;
  documentId: string;
  name?: string;
}

interface Media {
  id: number | string;
  documentId: string;
  name?: string;
  url?: string;
  size?: number;
  updatedAt?: DateTimeValue;
}

export interface SwissNamesRow {
  coord?: number[];
  [key: string]: string | number | number[];
}

type FeatureCollectionWithCRS = FeatureCollection & { crs?: { type: string; properties: { name?: string } } };

//for handle media url saved with local provider (to fetch internally)
function getMediaFetchUrl(media: Media) {
  if (!media) {
    return null;
  }
  let url = media.url;
  if (url.startsWith('/')) {
    url = `http${process.env.HTTPS === '1' ? 's' : ''}://localhost:${strapi.config.get('server.port', 1337)}${url}`;
  }
  return url;
}

async function findOrCreateFolder(strapi: Core.Strapi, folderName: string, parent: Folder | null = null) {
  let folder = await strapi.documents('plugin::upload.folder').findFirst({
    filters: {
      name: { $eq: folderName },
      parent: {
        documentId: { $eq: parent?.documentId ?? null },
      },
    },
    fields: ['id', 'name'],
  });

  if (!folder) {
    strapi.log.info('create new folder:', { name: folderName, parent: parent });
    const folderService = strapi.plugin('upload').service('folder');
    folder = await folderService.create({
      //folder service internally(in setPathIdAndPath) still use id not documentId
      name: folderName,
      parent: parent?.id,
    });
  }
  return folder;
}

async function downloadIfChanged(url: string, lastModified: string) {
  const getOptions = {
    headers: lastModified ? { 'If-Modified-Since': lastModified } : {},
  };
  const response = await fetch(url, getOptions);
  if (response.status === 304) {
    return {
      lastModified: response.headers.get('last-modified'),
      age: response.headers.get('age'),
      status: response.status,
    };
  }

  if (!response.ok) {
    return { status: response.status };
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    lastModified: response.headers.get('last-modified'),
    age: response.headers.get('age'),
    status: response.status,
  };
}

function formatForIfModifiedSince(timestamp: any) {
  if (!timestamp) return null;

  let date: Date;
  if (typeof timestamp === 'number') {
    // Unix-Timestamp (sec) → ms multiply
    date = new Date(timestamp * 1000);
  } else {
    date = new Date(timestamp);
  }

  if (isNaN(date.getTime())) {
    throw new Error('invalid Timestamp');
  }

  return date.toUTCString(); // → "Wed, 21 Oct 2015 07:28:00 GMT"
}

function renderUrlTemplate(tmpl: string, data: any) {
  return tmpl.replace(/\$\{(\w+)\}/g, (_, key) => (key in data ? data[key] : ''));
}

async function updateOrCreateMedia(
  strapi: Core.Strapi,
  folder: Folder,
  fileName: string,
  tempFilePath: string,
  size: number | undefined = undefined,
): Promise<Media> {
  const fileType = await fileTypeFromFile(tempFilePath);
  const mimetype = fileType?.mime || 'application/octet-stream';

  const fileData = {
    filepath: tempFilePath,
    originalFilename: fileName,
    mimetype: mimetype,
    size: size || (await stat(tempFilePath)).size,
  };
  //the upload service require id not documentId
  const metaData = { fileInfo: { name: fileName, folder: folder.id } };

  const existingFile = await strapi.documents('plugin::upload.file').findFirst({
    filters: { name: fileName, folder: { documentId: { $eq: folder.documentId } } },
    fields: ['id'],
  });
  const uploadService = strapi.plugin('upload').service('upload');
  if (existingFile) {
    return await uploadService.replace(existingFile.id, { data: metaData, file: fileData });
  } else {
    const result = await uploadService.upload({ data: metaData, files: fileData });
    return result[0];
  }
}

async function findLayerAndMedia(
  layerLabel: string,
  layerType: MapLayerType,
  mediaFileName: string,
  mediaFolder: Folder,
) {
  //check existing Layer / Media for check update required
  const mapLayer = await strapi.documents('api::map-layer.map-layer').findFirst({
    filters: { type: layerType, label: layerLabel, organization: null },
    populate: ['media_source'],
  });
  let media: Media;
  if (mapLayer) {
    if (mapLayer.media_source?.name === mediaFileName) {
      media = mapLayer.media_source;
    }
  }
  if (!media) {
    media = await strapi.documents('plugin::upload.file').findFirst({
      filters: { name: mediaFileName, folder: { documentId: { $eq: mediaFolder.documentId } } },
    });
  }
  return { mapLayer, media };
}

async function insertOrUpdateEntrancesMapLayer(
  mapLayer: Partial<MapLayer>,
  entrancesLayerName: string,
  sourceMedia: Media,
  styleMedia: Media,
) {
  const mapLayerData = {
    label: entrancesLayerName,
    type: MapLayerTypes.GEOJSON,
    //media is referenced by id not documentId
    media_source: sourceMedia.id,
    public: true,
    options: {
      hidden: false,
      opacity: 1,
      styleUrl: styleMedia?.url,
      searchable: true,
      attribution: [
        [
          'Bundesamt für Statistik; Eidg. Gebäude- und Wohnungsregister',
          'https://www.housing-stat.ch/de/madd/public.html',
        ],
      ],
      styleFormat: 'mapbox',
      styleSourceName: 'entrances',
      styleSourceType: 'url',
      searchRegExPatterns: [
        [
          '(?<streetName>\\p{L}+(?:[ -]\\p{L}+)*) (?<entranceNumber>\\d+ ?\\p{L}?),? (?<zip>\\d\\d\\d\\d) (?<locality>\\p{L}+(?: \\p{L}+)*)',
          'u',
        ],
        [
          '(?<streetName>\\p{L}+(?:[ -]\\p{L}+)*) (?<entranceNumber>\\d+ ?\\p{L}?),? (?<locality>\\p{L}+(?: \\p{L}+)*)',
          'u',
        ],
        ['(?<streetName>\\p{L}+(?:[ -]\\p{L}+)*) (?<entranceNumber>\\d+ ?\\p{L}?),? (?<zip>\\d{1,4})', 'u'],
        ['(?<streetName>\\p{L}+(?:[ -]\\p{L}+)*) (?<entranceNumber>\\d+\\p{L}?)', 'u'],
        ['(?<streetName>\\p{L}+(?:[ -]\\p{L}+)*),? (?<locality>\\p{L}+(?:[ .-]\\p{L}+)*?)', 'u'],
        ['(?<streetName>\\p{L}+(?:[ -]\\p{L}+)*)', 'u'],
        ['(?<entranceNumber>\\d+ ?\\p{L}?),? (?<zip>\\d\\d\\d\\d) (?<locality>\\p{L}+(?:[ .-]\\p{L}+)*)', 'u'],
        ['(?<entranceNumber>\\d+ ?\\p{L}?),? (?<locality>\\p{L}+(?:[ .-]\\p{L}+)*)', 'u'],
      ],
      searchResultLabelMask: '${streetName} ${entranceNumber}, ${zip} ${locality}',
      searchResultGroupingFilterFields: ['zip', 'locality', 'streetName'],
    },
  };
  //always set/update all fields to make sure changes in the config/template here are always updated.
  if (mapLayer) {
    return await strapi.documents('api::map-layer.map-layer').update({
      documentId: mapLayer.documentId,
      data: mapLayerData,
    });
  } else {
    return await strapi.documents('api::map-layer.map-layer').create({
      data: mapLayerData,
    });
  }
}

async function extractFilesToNewZip(inputZip: any, filterBasename: string, outputPath: string) {
  const outputZip = new AdmZip();
  let foundFiles = 0;
  for (const entry of inputZip.getEntries()) {
    if (basename(entry.entryName).startsWith(filterBasename)) {
      outputZip.addFile(basename(entry.entryName), entry.getData(), '');
      foundFiles++;
    }
  }

  if (foundFiles === 0) {
    return null;
  }

  outputZip.writeZip(outputPath);
  return outputZip;
}

async function exportToCSV(headers: string[], data: SwissNamesRow[], filePath: string) {
  const csvContent = await writeToString(data, {
    headers,
    delimiter: ';',
  });
  await writeFile(filePath, csvContent, 'utf8');
}

async function insertOrUpdateBoundariesMapLayer(
  mapLayer: Partial<MapLayer>,
  boundariesLayerName: string,
  sourceMedia: Media,
  styleMedia: Media,
  type: MapLayerType = MapLayerTypes.SHAPE,
) {
  const mapLayerData = {
    label: boundariesLayerName,
    type,
    //media is referenced by id not documentId
    media_source: sourceMedia.id,
    public: true,
    options: {
      hidden: false,
      opacity: 0.8,
      styleUrl: styleMedia?.url,
      searchable: true,
      attribution: [['swisstopo', 'https://www.swisstopo.admin.ch/de/home.html']],
      styleFormat: 'mapbox',
      styleSourceName: 'swissBOUNDARIES3D',
      styleSourceType: 'url',
      searchRegExPatterns: [['(?<NAME>\\p{L}+(?:[ -]\\p{L}+)*)', 'u']],
      searchResultLabelMask: '${NAME}',
      searchResultGroupingFilterFields: [],
    },
  };
  //always set/update all fields to make sure changes in the config/template here are always updated.
  if (mapLayer) {
    return await strapi.documents('api::map-layer.map-layer').update({
      documentId: mapLayer.documentId,
      data: mapLayerData,
    });
  } else {
    return await strapi.documents('api::map-layer.map-layer').create({
      data: mapLayerData,
    });
  }
}

export async function downloadAndExtractSwissBoundaries(params: {
  url: string;
  lastModified: string;
  tmpDir: string;
  cantonFile: string;
  districtFile: string;
  municipalityFile: string;
  create_municipality: boolean;
}) {
  const response = await downloadIfChanged(params.url, params.lastModified);
  if (response.buffer) {
    //extract corresponding files from zip and save temporarly (required for upload Service)
    const zip = new AdmZip(response.buffer);

    let cantonSuccess = false;
    let districtSuccess = false;
    let municipalitySuccess = false;

    //extract canton shape files
    let fullTmpPath = join(params.tmpDir, params.cantonFile);
    const cantonAreas = await extractFilesToNewZip(zip, 'swissBOUNDARIES3D_1_5_TLM_KANTONSGEBIET', fullTmpPath);
    if (cantonAreas) {
      cantonSuccess = true;
    }

    //extract district shape files
    fullTmpPath = join(params.tmpDir, params.districtFile);
    const districtAreas = await extractFilesToNewZip(zip, 'swissBOUNDARIES3D_1_5_TLM_BEZIRKSGEBIET', fullTmpPath);
    if (districtAreas) {
      districtSuccess = true;
    }

    if (params.create_municipality) {
      //extract municipality shape files
      fullTmpPath = join(params.tmpDir, params.municipalityFile);
      const municipalityAreas = await extractFilesToNewZip(zip, 'swissBOUNDARIES3D_1_5_TLM_HOHEITSGEBIET', fullTmpPath);
      if (municipalityAreas) {
        municipalitySuccess = true;
      }
    }
    return { cantonSuccess, districtSuccess, municipalitySuccess, downloaded: true };
  } else {
    return response;
  }
}

async function updateSwissBoundaries(
  strapi: Core.Strapi,
  url_template: string,
  boundariesFolder: Folder,
  styleMedia: Media,
  create_municipality: boolean,
  callWorker: <T>(func: string, params: any) => Promise<T>,
) {
  try {
    const tmpDir: string = strapi.config.get('server.tmpDir') || '/tmp';
    let cantonAreasMedia: Media;
    let districtAreasMedia: Media;
    let municipalityAreasMedia: Media;
    let lastModified: string;
    let year = new Date().getFullYear();
    let monthNo = new Date().getMonth() + 1;
    while (!cantonAreasMedia) {
      const month = ('0' + monthNo).slice(-2);
      //check for canton shape files
      const url = renderUrlTemplate(url_template, { year, month });
      const fileNameCanton = `swissBOUNDARIES3D_KANTONSGEBIET_${year}_${month}.zip`;
      const cantonLayerName = 'Kantonsgrenzen';
      let cantonMapLayer: Partial<MapLayer>;
      ({ mapLayer: cantonMapLayer, media: cantonAreasMedia } = await findLayerAndMedia(
        cantonLayerName,
        MapLayerTypes.SHAPE,
        fileNameCanton,
        boundariesFolder,
      ));
      lastModified = formatForIfModifiedSince(cantonAreasMedia?.updatedAt);

      //check for district shape files
      const fileNameDistrict = `swissBOUNDARIES3D_BEZIRKSGEBIET_${year}_${month}.zip`;

      const districtLayerName = 'Bezirksgrenzen';
      let districtMapLayer: Partial<MapLayer>;
      ({ mapLayer: districtMapLayer, media: districtAreasMedia } = await findLayerAndMedia(
        districtLayerName,
        MapLayerTypes.SHAPE,
        fileNameDistrict,
        boundariesFolder,
      ));
      if (districtAreasMedia === null) {
        lastModified = null;
      } else {
        lastModified = lastModified || formatForIfModifiedSince(districtAreasMedia?.updatedAt);
      }

      //check for municipality shape files
      const fileNameMunicipality = `swissBOUNDARIES3D_HOHEITSGEBIET_${year}_${month}.zip`;
      const municipalityLayerName = 'Gemeindegrenzen (Ganze Schweiz)';
      let municipalityMapLayer: Partial<MapLayer>;
      if (create_municipality) {
        ({ mapLayer: municipalityMapLayer, media: municipalityAreasMedia } = await findLayerAndMedia(
          municipalityLayerName,
          MapLayerTypes.SHAPE,
          fileNameMunicipality,
          boundariesFolder,
        ));
        if (municipalityAreasMedia === null) {
          lastModified = null;
        } else {
          lastModified = lastModified || formatForIfModifiedSince(municipalityAreasMedia?.updatedAt);
        }
      }

      const cantonFile = `strapi-${Date.now()}-${Math.random().toString(36).slice(2)}-${fileNameCanton}`;
      const districtFile = `strapi-${Date.now()}-${Math.random().toString(36).slice(2)}-${fileNameDistrict}`;
      const municipalityFile = `strapi-${Date.now()}-${Math.random().toString(36).slice(2)}-${fileNameMunicipality}`;
      const response = await callWorker<{
        status?: number;
        lastModified?: string;
        age?: string;
        cantonSuccess?: boolean;
        districtSuccess?: boolean;
        municipalitySuccess?: boolean;
        downloaded?: boolean;
      }>('downloadAndExtractSwissBoundaries', {
        url,
        lastModified,
        tmpDir,
        cantonFile,
        districtFile,
        municipalityFile,
        create_municipality,
      });
      if (response.downloaded) {
        strapi.log.info(`updateSwissBoundaries: new data loaded from ${url}`);
        let fullTmpPath = join(tmpDir, cantonFile);
        try {
          if (response.cantonSuccess) {
            cantonAreasMedia = await updateOrCreateMedia(strapi, boundariesFolder, fileNameCanton, fullTmpPath);
            strapi.log.info(`updateSwissBoundaries: media ${fileNameCanton} saved: ${cantonAreasMedia.id}`);
          }
        } finally {
          if (existsSync(fullTmpPath)) {
            await unlink(fullTmpPath).catch((err) => {
              strapi.log.warn(`updateSwissBoundaries: remove temp file failed: "${fullTmpPath}", ${err}`);
            });
          }
        }

        //extract district shape files
        fullTmpPath = join(tmpDir, districtFile);
        try {
          if (response.districtSuccess) {
            districtAreasMedia = await updateOrCreateMedia(strapi, boundariesFolder, fileNameDistrict, fullTmpPath);
            strapi.log.info(`updateSwissBoundaries: media ${fileNameDistrict} saved: ${districtAreasMedia.id}`);
          }
        } finally {
          if (existsSync(fullTmpPath)) {
            await unlink(fullTmpPath).catch((err) => {
              strapi.log.warn(`updateSwissBoundaries: remove temp file failed: "${fullTmpPath}", ${err}`);
            });
          }
        }

        if (create_municipality) {
          //extract municipality shape files
          fullTmpPath = join(tmpDir, municipalityFile);
          try {
            if (response.municipalitySuccess) {
              municipalityAreasMedia = await updateOrCreateMedia(
                strapi,
                boundariesFolder,
                fileNameMunicipality,
                fullTmpPath,
              );
              strapi.log.info(
                `updateSwissBoundaries: media ${fileNameMunicipality} saved: ${municipalityAreasMedia.id}`,
              );
            }
          } finally {
            if (existsSync(fullTmpPath)) {
              await unlink(fullTmpPath).catch((err) => {
                strapi.log.warn(`updateSwissBoundaries: remove temp file failed: "${fullTmpPath}", ${err}`);
              });
            }
          }
        }
      } else if (response.status === 304) {
        strapi.log.info(
          `updateSwissBoundaries: content ${year}_${month} not changed since: ${response.lastModified} / age: ${response.age}`,
        );
      } else if (response.status === 404) {
        strapi.log.info(`updateSwissBoundaries: ${year}_${month} file not found ${url}`);
      } else {
        throw new Error(`${url}: HTTP ${response.status}`);
      }
      if (!cantonAreasMedia) {
        monthNo -= 1;
        if (monthNo <= 0) {
          monthNo = 12;
          year -= 1;
          if (year < 2025) {
            return;
          }
        }
      } else {
        const savedLayer = await insertOrUpdateBoundariesMapLayer(
          cantonMapLayer,
          cantonLayerName,
          cantonAreasMedia,
          styleMedia,
        );
        strapi.log.info(
          `updateSwissBoundaries canton: maplayer "${cantonLayerName}" ${cantonMapLayer ? 'updated' : 'saved'}: ${savedLayer.id}`,
        );
        if (districtAreasMedia) {
          const savedLayer = await insertOrUpdateBoundariesMapLayer(
            districtMapLayer,
            districtLayerName,
            districtAreasMedia,
            styleMedia,
          );
          strapi.log.info(
            `updateSwissBoundaries district: maplayer "${districtLayerName}" ${districtMapLayer ? 'updated' : 'saved'}: ${savedLayer.id}`,
          );
        }
        if (create_municipality) {
          if (municipalityAreasMedia) {
            const savedLayer = await insertOrUpdateBoundariesMapLayer(
              municipalityMapLayer,
              municipalityLayerName,
              municipalityAreasMedia,
              styleMedia,
            );
            strapi.log.info(
              `updateSwissBoundaries municipality: maplayer "${municipalityLayerName}" ${municipalityMapLayer ? 'updated' : 'saved'}: ${savedLayer.id}`,
            );
          }
        }
      }
    }
    return { cantonAreasMedia, districtAreasMedia, municipalityAreasMedia };
  } catch (error) {
    strapi.log.error(`updateSwissBoundaries: error ${error.stack ?? error}`);
    return null;
  }
}

export async function extractMunicipality(
  params: {
    cantonFeature: Feature;
    canton: string;
    municipalityMediaFile: string;
    tmpDir: string;
    municipalityCantonFile: string;
  },
  fileCache: Map<string, FeatureCollection>,
) {
  let geojson: FeatureCollection = fileCache.get(params.municipalityMediaFile);
  if (!geojson) {
    geojson = await loadShpFile(params.municipalityMediaFile);
    fileCache[params.municipalityMediaFile] = geojson;
  }
  let features: Feature[];
  if (!params.cantonFeature) {
    features = getMunicipalityFeaturesCountry(params.canton, geojson);
  } else {
    features = getMunicipalityFeatures(params.cantonFeature, geojson);
  }
  const newCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features,
  };
  let municipalitySuccess = false;
  if (newCollection.features.length > 0) {
    const fullTmpPath = join(params.tmpDir, params.municipalityCantonFile);
    await writeFile(fullTmpPath, JSON.stringify(newCollection), 'utf8');
    municipalitySuccess = true;
  }
  return { municipalitySuccess };
}

async function updateMunicipalityCanton(
  strapi: Core.Strapi,
  canton: string,
  cantonFeature: Feature,
  mediaFolder: Folder,
  styleMedia: Media,
  mediaUpdatedAt: DateTimeValue | undefined,
  municipalityMediaFile: string,
  callWorker: <T>(func: string, params: any) => Promise<T>,
) {
  const tmpDir: string = strapi.config.get('server.tmpDir') || '/tmp';
  strapi.log.info(`updateMunicipalityCanton for ${canton}: start`);

  const municipalityCantonLayerName = `Gemeindegrenzen (${canton})`;
  const municipalityCantonFileName = `municipality_${canton}.geojson`;
  let { mapLayer: municipalityCantonMapLayer, media: municipalityCantonMedia } = await findLayerAndMedia(
    municipalityCantonLayerName,
    MapLayerTypes.GEOJSON,
    municipalityCantonFileName,
    mediaFolder,
  );
  if (!municipalityCantonMedia || !mediaUpdatedAt || municipalityCantonMedia.updatedAt < mediaUpdatedAt) {
    const municipalityCantonFile = `strapi-${Date.now()}-${Math.random().toString(36).slice(2)}-${municipalityCantonFileName}`;
    const response = await callWorker<{ municipalitySuccess?: boolean }>('extractMunicipality', {
      cantonFeature,
      canton,
      municipalityMediaFile,
      tmpDir,
      municipalityCantonFile,
    });
    if (response.municipalitySuccess) {
      const fullTmpPath = join(tmpDir, municipalityCantonFile);
      try {
        municipalityCantonMedia = await updateOrCreateMedia(
          strapi,
          mediaFolder,
          municipalityCantonFileName,
          fullTmpPath,
        );
        strapi.log.info(
          `updateMunicipalityCanton for ${canton}: media ${municipalityCantonFileName} saved: ${municipalityCantonMedia.id}`,
        );
      } finally {
        if (existsSync(fullTmpPath)) {
          await unlink(fullTmpPath).catch((err) => {
            strapi.log.warn(
              `updateMunicipalityCanton for ${canton}: remove temp file failed: "${fullTmpPath}", ${err}`,
            );
          });
        }
      }
    } else {
      strapi.log.error(`updateMunicipalityCanton for ${canton}: no data after geo filtering`);
    }
  }

  if (municipalityCantonMedia) {
    const savedLayer = await insertOrUpdateBoundariesMapLayer(
      municipalityCantonMapLayer,
      municipalityCantonLayerName,
      municipalityCantonMedia,
      styleMedia,
      MapLayerTypes.GEOJSON,
    );
    strapi.log.info(
      `updateMunicipalityCanton for ${canton}: maplayer "${municipalityCantonLayerName}" ${municipalityCantonMapLayer ? 'updated' : 'saved'}: ${savedLayer.id}`,
    );
  }
  strapi.log.info(`updateMunicipalityCanton for ${canton}: finished`);
}

function getCantonFeature(cantonAreasGeoJSON: FeatureCollection, canton: string) {
  if (!cantonAreasGeoJSON) {
    return null;
  }
  const cantonName = CANTON_NAMES[canton];
  return cantonAreasGeoJSON.features.find((feature) => feature.properties?.NAME === cantonName) as Feature<
    Polygon | MultiPolygon
  >;
}

function getDistrictFeatures(cantonFeature: Feature, districtAreasGeoJSON: FeatureCollection) {
  if (!cantonFeature || !districtAreasGeoJSON) {
    return null;
  }
  const cantonNo = cantonFeature.properties?.KANTONSNUM;
  return districtAreasGeoJSON.features.filter((feature) => feature.properties?.KANTONSNUM === cantonNo) as Feature<
    Polygon | MultiPolygon
  >[];
}

function getMunicipalityFeatures(cantonFeature: Feature, municipalityGeoJSON: FeatureCollection) {
  if (!cantonFeature || !municipalityGeoJSON) {
    return null;
  }
  const cantonNo = cantonFeature.properties?.KANTONSNUM;
  return municipalityGeoJSON.features.filter((feature) => feature.properties?.KANTONSNUM === cantonNo) as Feature<
    Polygon | MultiPolygon
  >[];
}

function getMunicipalityFeaturesCountry(country: string, municipalityGeoJSON: FeatureCollection) {
  if (!country || !municipalityGeoJSON) {
    return null;
  }
  return municipalityGeoJSON.features.filter((feature) => feature.properties?.ICC === country) as Feature<
    Polygon | MultiPolygon
  >[];
}

async function insertOrUpdateLocalityMapLayer(
  mapLayer: Partial<MapLayer>,
  localitiesLayerName: string,
  sourceMedia: Media,
  styleMedia: Media,
  type: MapLayerType = MapLayerTypes.SHAPE,
  isZip = false,
) {
  let searchRegExPatterns: Array<Array<string>>;
  let searchResultLabelMask: string;
  if (isZip) {
    if (type === MapLayerTypes.SHAPE) {
      //the zip shape layer have no name field, it's only added on filtered GEOJSON variant
      searchRegExPatterns = [['(?<ZIP4>\\d\\d\\d\\d)', 'u']];
      searchResultLabelMask = '${ZIP4}';
    } else {
      searchRegExPatterns = [
        ['(?<NAME>\\p{L}+(?:[ -]\\p{L}+)*)', 'u'],
        ['(?<ZIP4>\\d{2,4})', 'u'],
        ['(?<ZIP4>\\d{2,4}) (?<NAME>\\p{L}+(?:[ -]\\p{L}+)*)', 'u'],
      ];
      searchResultLabelMask = '${ZIP4} ${NAME}';
    }
  } else {
    searchRegExPatterns = [['(?<NAME>\\p{L}+(?:[ -]\\p{L}+)*)', 'u']];
    searchResultLabelMask = '${NAME}';
  }
  const mapLayerData = {
    label: localitiesLayerName,
    type,
    //media is referenced by id not documentId
    media_source: sourceMedia.id,
    public: true,
    options: {
      hidden: false,
      opacity: 0.6,
      styleUrl: styleMedia?.url,
      searchable: true,
      attribution: [['swisstopo', 'https://www.swisstopo.admin.ch/de/home.html']],
      styleFormat: 'mapbox',
      styleSourceName: 'locality',
      styleSourceType: 'url',
      searchRegExPatterns,
      searchResultLabelMask,
      searchResultGroupingFilterFields: [],
    },
  };
  //always set/update all fields to make sure changes in the config/template here are always updated.
  if (mapLayer) {
    return await strapi.documents('api::map-layer.map-layer').update({
      documentId: mapLayer.documentId,
      data: mapLayerData,
    });
  } else {
    return await strapi.documents('api::map-layer.map-layer').create({
      data: mapLayerData,
    });
  }
}

export async function downloadAndExtractLocality(params: {
  url: string;
  lastModified: string;
  tmpDir: string;
  localityFile: string;
  zipFile: string;
  create_zip: boolean;
}) {
  const response = await downloadIfChanged(params.url, params.lastModified);
  if (response.buffer) {
    //extract corresponding files from zip and save temporarly (required for upload Service)
    const zip = new AdmZip(response.buffer);

    let localitySuccess = false;
    let zipSuccess = false;

    //extract locality shape files
    let fullTmpPath = join(params.tmpDir, params.localityFile);
    const localityAreas = await extractFilesToNewZip(zip, 'AMTOVZ_LOCALITY', fullTmpPath);
    if (localityAreas) {
      localitySuccess = true;
    }

    if (params.create_zip) {
      //extract zip shape files
      fullTmpPath = join(params.tmpDir, params.zipFile);
      const zipAreas = await extractFilesToNewZip(zip, 'AMTOVZ_ZIP', fullTmpPath);
      if (zipAreas) {
        zipSuccess = true;
      }
    }
    return { localitySuccess, zipSuccess, downloaded: true };
  } else {
    return response;
  }
}

async function updateLocality(
  strapi: Core.Strapi,
  url: string,
  localitiesFolder: Folder,
  styleMedia: Media,
  create_locality: boolean,
  create_zip: boolean,
  callWorker: <T>(func: string, params: any) => Promise<T>,
) {
  try {
    const tmpDir: string = strapi.config.get('server.tmpDir') || '/tmp';
    let localityMedia: Media;
    let zipMedia: Media;
    let lastModified: string;
    //check for locality shape files
    const fileNameLocality = 'AMTOVZ_LOCALITY.zip';
    const localityLayerName = 'Ortschaftsgrenzen (Ganze Schweiz)';
    let localityMapLayer: Partial<MapLayer>;
    if (create_locality || create_zip) {
      ({ mapLayer: localityMapLayer, media: localityMedia } = await findLayerAndMedia(
        localityLayerName,
        MapLayerTypes.SHAPE,
        fileNameLocality,
        localitiesFolder,
      ));
      lastModified = formatForIfModifiedSince(localityMedia?.updatedAt);
    }

    //check for zip shape files
    const fileNameZip = 'AMTOVZ_ZIP.zip';
    const zipLayerName = 'PLZ-Grenzen (Ganze Schweiz, nur PLZ keine Ortsnamen)';
    let zipMapLayer: Partial<MapLayer>;
    if (create_zip) {
      ({ mapLayer: zipMapLayer, media: zipMedia } = await findLayerAndMedia(
        zipLayerName,
        MapLayerTypes.SHAPE,
        fileNameZip,
        localitiesFolder,
      ));
      if (zipMedia === null) {
        lastModified = null;
      } else {
        lastModified = lastModified || formatForIfModifiedSince(zipMedia?.updatedAt);
      }
    }

    const localityFile = `strapi-${Date.now()}-${Math.random().toString(36).slice(2)}-${fileNameLocality}`;
    const zipFile = `strapi-${Date.now()}-${Math.random().toString(36).slice(2)}-${fileNameZip}`;
    const response = await callWorker<{
      status?: number;
      lastModified?: string;
      age?: string;
      localitySuccess?: boolean;
      zipSuccess?: boolean;
      downloaded?: boolean;
    }>('downloadAndExtractLocality', {
      url,
      lastModified,
      tmpDir,
      localityFile,
      zipFile,
      create_zip,
    });
    if (response.downloaded) {
      strapi.log.info(`updateLocality: new data loaded from ${url}`);
      //extract locality shape files
      let fullTmpPath = join(tmpDir, localityFile);
      try {
        if (response.localitySuccess) {
          localityMedia = await updateOrCreateMedia(strapi, localitiesFolder, fileNameLocality, fullTmpPath);
          strapi.log.info(`updateLocality: media ${fileNameLocality} saved: ${localityMedia.id}`);
        }
      } finally {
        if (existsSync(fullTmpPath)) {
          await unlink(fullTmpPath).catch((err) => {
            strapi.log.warn(`updateLocality: remove temp file failed: "${fullTmpPath}", ${err}`);
          });
        }
      }

      //extract zip shape files
      fullTmpPath = join(tmpDir, zipFile);
      try {
        if (create_zip) {
          if (response.zipSuccess) {
            zipMedia = await updateOrCreateMedia(strapi, localitiesFolder, fileNameZip, fullTmpPath);
            strapi.log.info(`updateLocality: media ${fileNameZip} saved: ${zipMedia.id}`);
          }
        }
      } finally {
        if (existsSync(fullTmpPath)) {
          await unlink(fullTmpPath).catch((err) => {
            strapi.log.warn(`updateLocality: remove temp file failed: "${fullTmpPath}", ${err}`);
          });
        }
      }
    } else if (response.status === 304) {
      strapi.log.info(`updateLocality: content not changed since: ${response.lastModified} / age: ${response.age}`);
    } else if (response.status === 404) {
      strapi.log.info(`updateLocality: file not found ${url}`);
    } else {
      throw new Error(`${url}: HTTP ${response.status}`);
    }
    if (localityMedia) {
      if (create_locality) {
        const savedLayer = await insertOrUpdateLocalityMapLayer(
          localityMapLayer,
          localityLayerName,
          localityMedia,
          styleMedia,
        );
        strapi.log.info(
          `updateLocality locality: maplayer "${localityLayerName}" ${localityMapLayer ? 'updated' : 'saved'}: ${savedLayer.id}`,
        );
      }
      if (zipMedia && create_zip) {
        const savedLayer = await insertOrUpdateLocalityMapLayer(
          zipMapLayer,
          zipLayerName,
          zipMedia,
          styleMedia,
          MapLayerTypes.SHAPE,
          true,
        );
        strapi.log.info(
          `updateLocality zip: maplayer "${zipLayerName}" ${zipMapLayer ? 'updated' : 'saved'}: ${savedLayer.id}`,
        );
      } else {
        strapi.log.error('updateLocality zip: media not available');
      }
    } else {
      strapi.log.error('updateLocality locality/zip: localityMedia not available');
    }
    return { localityMedia, zipMedia };
  } catch (error) {
    strapi.log.error(`updateLocality: error ${error.stack ?? error}`);
    return null;
  }
}

export function bboxIntersect(a: BBox, b: BBox): boolean {
  return !(
    (
      a[2] < b[0] || // a.maxX < b.minX
      a[0] > b[2] || // a.minX > b.maxX
      a[3] < b[1] || // a.maxY < b.minY
      a[1] > b[3]
    ) // a.minY > b.maxY
  );
}

function filterIntersect(
  features: Feature<Polygon | MultiPolygon>[],
  checkArea: Feature<Polygon | MultiPolygon>,
  isIntersectAreaCountAsIntersect: (feature: Feature, intersectAreaSize: number) => boolean,
  isIntersectAreaCountAsFullInside: (feature: Feature, intersectAreaSize: number) => boolean,
  removeFullyInside = true,
) {
  const areaBbox = bbox(checkArea);
  const checkAreaShrinked = buffer(checkArea, -10, { units: 'meters', steps: 1 });
  const checkAreaExtended = buffer(checkArea, 30, { units: 'meters', steps: 1 });
  const fullyInside = new Set<Feature>();

  const filtered = features.filter((feature) => {
    // BBOX-Pre-Filter
    if (!bboxIntersect(areaBbox, bbox(feature))) return false;

    // not intersect
    if (booleanDisjoint(feature, checkArea)) return false;

    // completely inside (30m extended area, to ignore small border issues), does not support MultiPolygon
    if (feature.geometry.type === 'Polygon' && booleanWithin(feature, checkAreaExtended)) {
      fullyInside.add(feature);
      return true;
    }

    // faster pre check with a 10m shrinked checkArea (prevent "border only")
    if (!booleanIntersects(feature, checkAreaShrinked)) return false;

    // get intersecting area
    const hit = intersect({
      type: 'FeatureCollection',
      features: [feature, checkArea],
    });
    if (!hit) return false;

    const intersectAreaSize = area(hit);
    //check if valid, or only touching border / small irrelevant area
    const valid = isIntersectAreaCountAsIntersect(feature, intersectAreaSize);
    if (valid && isIntersectAreaCountAsFullInside(feature, intersectAreaSize)) {
      fullyInside.add(feature);
    }
    return valid;
  });

  if (removeFullyInside) {
    //remove the one fully inside, as cannot be in any other / later filterIntersect call
    for (let i = features.length - 1; i >= 0; i--) {
      if (fullyInside.has(features[i])) {
        features.splice(i, 1);
      }
    }
  }

  return filtered;
}

export async function extractLocality(
  params: {
    cantonFeature: Feature;
    localityMediaFile: string;
    zipMediaFile: string;
    tmpDir: string;
    localityCantonFile: string;
    zipCantonFile: string;
    create_locality: boolean;
    create_locality_zip: boolean;
  },
  fileCache: Map<string, FeatureCollection>,
) {
  let geojsonLocality: FeatureCollection = fileCache.get(params.localityMediaFile);
  if (!geojsonLocality) {
    geojsonLocality = await loadShpFile(params.localityMediaFile);
    fileCache[params.localityMediaFile] = geojsonLocality;
  }
  let geojsonZip: FeatureCollection = fileCache.get(params.zipMediaFile);
  if (!geojsonZip && params.create_locality_zip) {
    geojsonZip = await loadShpFile(params.zipMediaFile);
    fileCache[params.zipMediaFile] = geojsonZip;
  }

  const areaBelongToCanton = (feature: Feature, intersectAreaSize: number) => {
    //min 10% of area
    return intersectAreaSize / feature.properties['SHAPE_AREA'] > 0.1;
  };
  const areaBelongOnlyToCanton = (feature: Feature, intersectAreaSize: number) => {
    //min 90% of area
    return intersectAreaSize / feature.properties['SHAPE_AREA'] > 0.9;
  };

  let featuresListToReadNames = geojsonLocality.features;
  let localitySuccess = false;
  if (params.create_locality) {
    //find locality in cantonArea
    const localityFeatures = filterIntersect(
      geojsonLocality.features as Feature<Polygon | MultiPolygon>[],
      params.cantonFeature as Feature<Polygon | MultiPolygon>,
      areaBelongToCanton,
      areaBelongOnlyToCanton,
    );
    featuresListToReadNames = localityFeatures;
    const filteredLocalityCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: localityFeatures,
    };
    //save as file for media update
    if (filteredLocalityCollection.features.length > 0) {
      const fullTmpPath = join(params.tmpDir, params.localityCantonFile);
      await writeFile(fullTmpPath, JSON.stringify(filteredLocalityCollection), 'utf8');
      localitySuccess = true;
    }
  }

  let zipSuccess = false;
  if (params.create_locality_zip) {
    //find zip in cantonArea
    const zipFeatures = filterIntersect(
      geojsonZip.features as Feature<Polygon | MultiPolygon>[],
      params.cantonFeature as Feature<Polygon | MultiPolygon>,
      areaBelongToCanton,
      areaBelongOnlyToCanton,
    );
    //add matching NAME from locality
    zipFeatures.forEach((feature) => {
      feature.properties['NAME'] = featuresListToReadNames.find(
        (f) => f.properties['LOCALITYID'] === feature.properties['FK_LOCALIT'],
      )?.properties['NAME'];
    });
    const filteredZipCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: zipFeatures,
    };
    //save as file for media update
    if (filteredZipCollection.features.length > 0) {
      const fullTmpPath = join(params.tmpDir, params.zipCantonFile);
      await writeFile(fullTmpPath, JSON.stringify(filteredZipCollection), 'utf8');
      zipSuccess = true;
    }
  }
  return { localitySuccess, zipSuccess };
}

async function updateLocalityCanton(
  strapi: Core.Strapi,
  canton: string,
  cantonFeature: Feature,
  mediaFolder: Folder,
  styleMedia: Media,
  localityMediaFile: string,
  localityMediaLastModified: DateTimeValue | undefined,
  zipMediaFile: string,
  zipMediaLastModified: DateTimeValue | undefined,
  create_locality: boolean,
  create_locality_zip: boolean,
  callWorker: <T>(func: string, params: any) => Promise<T>,
) {
  const tmpDir: string = strapi.config.get('server.tmpDir') || '/tmp';
  strapi.log.info(`updateLocalityCanton for ${canton}: start`);

  const localityCantonLayerName = `Ortschaftsgrenzen (${canton})`;
  const localityCantonFileName = `locality_${canton}.geojson`;
  let { mapLayer: localityCantonMapLayer, media: localityCantonMedia } = await findLayerAndMedia(
    localityCantonLayerName,
    MapLayerTypes.GEOJSON,
    localityCantonFileName,
    mediaFolder,
  );
  const zipCantonLayerName = `PLZ-Grenzen (${canton})`;
  const zipCantonFileName = `zip_${canton}.geojson`;
  let { mapLayer: zipCantonMapLayer, media: zipCantonMedia } = await findLayerAndMedia(
    zipCantonLayerName,
    MapLayerTypes.GEOJSON,
    zipCantonFileName,
    mediaFolder,
  );
  const mediaNeedUpdate =
    (create_locality &&
      (!localityCantonMedia ||
        !localityMediaLastModified ||
        localityCantonMedia.updatedAt < localityMediaLastModified)) ||
    (create_locality_zip &&
      (!zipCantonMedia || !zipMediaLastModified || zipCantonMedia.updatedAt < zipMediaLastModified));
  if (mediaNeedUpdate) {
    const localityCantonFile = `strapi-${Date.now()}-${Math.random().toString(36).slice(2)}-${localityCantonFileName}`;
    const zipCantonFile = `strapi-${Date.now()}-${Math.random().toString(36).slice(2)}-${zipCantonFileName}`;
    const response = await callWorker<{ localitySuccess?: boolean; zipSuccess?: boolean }>('extractLocality', {
      cantonFeature,
      localityMediaFile,
      zipMediaFile,
      tmpDir,
      localityCantonFile,
      zipCantonFile,
      create_locality,
      create_locality_zip,
    });
    if (response.localitySuccess && create_locality) {
      const fullTmpPath = join(tmpDir, localityCantonFile);
      try {
        localityCantonMedia = await updateOrCreateMedia(strapi, mediaFolder, localityCantonFileName, fullTmpPath);
        strapi.log.info(
          `updateLocalityCanton for ${canton}: media ${localityCantonFileName} saved: ${localityCantonMedia.id}`,
        );
      } finally {
        if (existsSync(fullTmpPath)) {
          await unlink(fullTmpPath).catch((err) => {
            strapi.log.warn(`updateLocalityCanton for ${canton}: remove temp file failed: "${fullTmpPath}", ${err}`);
          });
        }
      }
    } else {
      strapi.log.error(`updateLocalityCanton for ${canton}: no locality data after geo filtering`);
    }
    if (response.zipSuccess && create_locality_zip) {
      const fullTmpPath = join(tmpDir, zipCantonFile);
      try {
        zipCantonMedia = await updateOrCreateMedia(strapi, mediaFolder, zipCantonFileName, fullTmpPath);
        strapi.log.info(`updateLocalityCanton for ${canton}: media ${zipCantonFileName} saved: ${zipCantonMedia.id}`);
      } finally {
        if (existsSync(fullTmpPath)) {
          await unlink(fullTmpPath).catch((err) => {
            strapi.log.warn(`updateLocalityCanton for ${canton}: remove temp file failed: "${fullTmpPath}", ${err}`);
          });
        }
      }
    } else {
      strapi.log.error(`updateLocalityCanton for ${canton}: no zip data after geo filtering`);
    }
  }

  if (localityCantonMedia && create_locality) {
    const savedLayer = await insertOrUpdateLocalityMapLayer(
      localityCantonMapLayer,
      localityCantonLayerName,
      localityCantonMedia,
      styleMedia,
      MapLayerTypes.GEOJSON,
    );
    strapi.log.info(
      `updateLocalityCanton for ${canton}: maplayer "${localityCantonLayerName}" ${localityCantonMapLayer ? 'updated' : 'saved'}: ${savedLayer.id}`,
    );
  }

  if (zipCantonMedia && create_locality_zip) {
    const savedLayer = await insertOrUpdateLocalityMapLayer(
      zipCantonMapLayer,
      zipCantonLayerName,
      zipCantonMedia,
      styleMedia,
      MapLayerTypes.GEOJSON,
      true,
    );
    strapi.log.info(
      `updateLocalityCanton for ${canton}: maplayer "${zipCantonLayerName}" ${zipCantonMapLayer ? 'updated' : 'saved'}: ${savedLayer.id}`,
    );
  }
  strapi.log.info(`updateLocalityCanton for ${canton}: finished`);
}

export async function extractEntranceDistrict(
  params: { district: Feature<Polygon | MultiPolygon>; cantonFile: string; tmpDir: string; districtFile: string },
  fileCache: Map<string, FeatureCollection>,
) {
  let coordConverter: proj4.Converter;
  let geojson: FeatureCollectionWithCRS = fileCache.get(params.cantonFile);
  if (!geojson) {
    if (!params.cantonFile.startsWith('http')) {
      throw new Error("cantonFile is a local one but it's not in cache");
    }
    const response = await fetch(params.cantonFile);
    geojson = (await response.json()) as FeatureCollection;
  }
  const match = geojson.crs?.properties?.name?.match(/(\d+)\s*$/);
  if (match) {
    coordConverter = proj4('EPSG:' + match[1], 'EPSG:4326');
  } else {
    //default in new RFC‑7946 is no crs and data in EPSG:4326 -> no conversion required
    coordConverter = { forward: (c) => c, inverse: (c) => c };
  }

  const newCollection: FeatureCollectionWithCRS = {
    type: 'FeatureCollection',
    features: geojson.features.filter(
      (feature) =>
        feature.geometry.type === 'Point' &&
        booleanPointInPolygon(coordConverter.forward(feature.geometry.coordinates), params.district),
    ),
  };
  if (geojson.crs) {
    newCollection.crs = geojson.crs;
  }
  let districtSuccess = false;
  if (newCollection.features.length > 0) {
    const fullTmpPath = join(params.tmpDir, params.districtFile);
    await writeFile(fullTmpPath, JSON.stringify(newCollection), 'utf8');
    districtSuccess = true;
  }
  return { districtSuccess };
}

async function updateEntranceDistrict(
  strapi: Core.Strapi,
  canton: string,
  mediaFolder: Folder,
  styleMedia: Media,
  allwaysCreateDistrict: boolean,
  districtFeaures: Feature<Polygon | MultiPolygon>[],
  mediaUpdatedAt: DateTimeValue | undefined,
  dataSize: number,
  cantonFile: string,
  callWorker: <T>(func: string, params: any) => Promise<T>,
) {
  const tmpDir: string = strapi.config.get('server.tmpDir') || '/tmp';
  const fileNeedSplit = dataSize > ENTRANCE_NEED_SPLIT_SIZE;
  if (allwaysCreateDistrict || fileNeedSplit) {
    if (!districtFeaures || districtFeaures.length < 2) {
      strapi.log.info(
        `updateEntranceDistrict for ${canton}: no district splitting (have ${districtFeaures?.length} definitions)`,
      );
      return;
    }
    strapi.log.info(`updateEntranceDistrict for ${canton}: start`);

    for (const district of districtFeaures) {
      try {
        const districtName = district.properties.NAME;
        strapi.log.info(`updateEntranceDistrict for ${canton}: start ${districtName}`);
        const entrancesDistrictLayerName = `Hausnummern / Addressuche (${canton}: ${districtName})`;
        const districtFileName = `entrances_${canton}_${districtName.replace(/[^a-zA-Z]/g, '_')}.geojson`;
        let { mapLayer: districtMapLayer, media: districtMedia } = await findLayerAndMedia(
          entrancesDistrictLayerName,
          MapLayerTypes.GEOJSON,
          districtFileName,
          mediaFolder,
        );
        if (!districtMedia || !mediaUpdatedAt || districtMedia.updatedAt < mediaUpdatedAt) {
          const districtFile = `strapi-${Date.now()}-${Math.random().toString(36).slice(2)}-${districtFileName}`;
          const response = await callWorker<{ districtSuccess?: boolean }>('extractEntranceDistrict', {
            district,
            cantonFile,
            tmpDir,
            districtFile,
          });
          if (response.districtSuccess) {
            const fullTmpPath = join(tmpDir, districtFile);
            try {
              districtMedia = await updateOrCreateMedia(strapi, mediaFolder, districtFileName, fullTmpPath);
              strapi.log.info(
                `updateEntranceDistrict for ${canton} / ${districtName}: media ${districtFileName} saved: ${districtMedia.id}`,
              );
            } finally {
              if (existsSync(fullTmpPath)) {
                await unlink(fullTmpPath).catch((err) => {
                  strapi.log.warn(
                    `updateEntranceDistrict for ${canton} / ${districtName}: remove temp file failed: "${fullTmpPath}", ${err}`,
                  );
                });
              }
            }
          } else {
            strapi.log.error(`updateEntranceDistrict for ${canton} / ${districtName}: no data after geo filtering`);
          }
        }

        if (districtMedia) {
          const savedLayer = await insertOrUpdateEntrancesMapLayer(
            districtMapLayer,
            entrancesDistrictLayerName,
            districtMedia,
            styleMedia,
          );
          strapi.log.info(
            `updateEntranceDistrict for ${canton} / ${districtName}: maplayer "${entrancesDistrictLayerName}" ${districtMapLayer ? 'updated' : 'saved'}: ${savedLayer.id}`,
          );
        }
        strapi.log.info(`updateEntranceDistrict for ${canton}: finished ${districtName}`);
      } catch (error) {
        strapi.log.error(error);
      }
    }
    strapi.log.info(`updateEntranceDistrict for ${canton}: finished all`);
  } else {
    strapi.log.info(`updateEntranceDistrict for ${canton}: no district splitting required`);
  }
  callWorker('removeFileCache', cantonFile);
}

export async function downloadAndExtractEntrance(
  params: {
    url: string;
    lastModified: string;
    tmpDir: string;
    canton: string;
    cantonFile: string;
    allwaysCreateDistrict: boolean;
    districtFile: string;
  },
  fileCache: Map<string, FeatureCollection>,
) {
  const response = await downloadIfChanged(params.url, params.lastModified);
  if (response.buffer) {
    //extract corresponding file from zip and save temporarly (required for upload Service)
    const zip = new AdmZip(response.buffer);
    const targetEntry = zip.getEntry('entrances.geojson');
    if (!targetEntry) {
      throw new Error(`updateEntrance for ${params.canton}: MADD zip have no entrances.geojson`);
    }

    let cantonSuccess = false;
    const fileToBig = targetEntry.header.size > ENTRANCE_TO_BIG_SIZE;
    if (!fileToBig) {
      //only save full canton file as media & layer if not to big
      const success = zip.extractEntryTo(targetEntry, params.tmpDir, false, true, false, params.cantonFile);
      if (success) {
        cantonSuccess = true;
      }
    }
    const fileNeedSplit = targetEntry.header.size > ENTRANCE_NEED_SPLIT_SIZE;
    if (params.allwaysCreateDistrict || fileNeedSplit) {
      const geojsonText = targetEntry.getData().toString('utf8');
      const fullTmpPath = join(params.tmpDir, params.cantonFile);
      fileCache.set(fullTmpPath, JSON.parse(geojsonText) as FeatureCollection);
    }

    return { fileToBig, cantonSuccess, fileSize: targetEntry.header.size };
  } else {
    return response;
  }
}

async function updateEntrance(
  strapi: Core.Strapi,
  url_template: string,
  canton: string,
  mediaFolder: Folder,
  styleMedia: Media,
  allwaysCreateDistrict: boolean,
  districtFeaures: Feature<Polygon | MultiPolygon>[],
  callWorker: <T>(func: string, params: any) => Promise<T>,
) {
  try {
    const entrancesLayerName = `Hausnummern / Addressuche (${canton})`;
    const fileName = `entrances_${canton}.geojson`;
    let { mapLayer, media } = await findLayerAndMedia(entrancesLayerName, MapLayerTypes.GEOJSON, fileName, mediaFolder);
    const lastModified = formatForIfModifiedSince(media?.updatedAt);
    //For files bigger than ENTRANCE_TO_BIG_SIZE it always download the file, as it have no lastModified information to compare.
    //But as the MADD data changes daily in normal case it's loaded anyway.

    const url = renderUrlTemplate(url_template, { canton: canton.toLowerCase() });
    const tmpDir: string = strapi.config.get('server.tmpDir') || '/tmp';
    const cantonFile = `strapi-${Date.now()}-${Math.random().toString(36).slice(2)}-${fileName}`;
    const fullTmpPath = join(tmpDir, cantonFile);
    let districtUpdated = false;
    const response = await callWorker<{
      status?: number;
      lastModified?: string;
      age?: string;
      fileToBig: boolean;
      cantonSuccess?: boolean;
      fileSize?: number;
    }>('downloadAndExtractEntrance', { url, lastModified, tmpDir, canton, cantonFile });
    if (response.fileSize) {
      strapi.log.info(`updateEntrance for ${canton}: new media loaded from ${url}`);
      //extract corresponding file from zip and save temporarly (required for upload Service)
      await updateEntranceDistrict(
        strapi,
        canton,
        mediaFolder,
        styleMedia,
        allwaysCreateDistrict,
        districtFeaures,
        media?.updatedAt || (response.lastModified ? new Date(response.lastModified) : null),
        response.fileSize,
        fullTmpPath,
        callWorker,
      );

      districtUpdated = true;
      if (!response.fileToBig) {
        try {
          if (!response.cantonSuccess) {
            strapi.log.error(`updateEntrance for ${canton}: extract entrances.geojson to "${fullTmpPath}" failed`);
            return;
          }
          strapi.log.info(`updateEntrance for ${canton}: entrances.geojson extracted`);

          media = await updateOrCreateMedia(strapi, mediaFolder, fileName, fullTmpPath, response.fileSize);
          strapi.log.info(`updateEntrance for ${canton}: media ${fileName} saved: ${media.id}`);
        } finally {
          if (existsSync(fullTmpPath)) {
            await unlink(fullTmpPath).catch((err) => {
              strapi.log.warn(`updateEntrance for ${canton}: remove temp file failed: "${fullTmpPath}", ${err}`);
            });
          }
        }
      }
    } else if (response.status === 304) {
      strapi.log.info(`updateEntrance for ${canton}: MADD content not changed since: ${response.lastModified}`);
    } else {
      throw new Error(`${url}: HTTP ${response.status}`);
    }
    if (media) {
      if (!districtUpdated) {
        await updateEntranceDistrict(
          strapi,
          canton,
          mediaFolder,
          styleMedia,
          allwaysCreateDistrict,
          districtFeaures,
          media?.updatedAt,
          media.size * 1000,
          getMediaFetchUrl(media),
          callWorker,
        );
      }

      const savedLayer = await insertOrUpdateEntrancesMapLayer(mapLayer, entrancesLayerName, media, styleMedia);
      strapi.log.info(
        `updateEntrance for ${canton}: maplayer "${entrancesLayerName}" ${mapLayer ? 'updated' : 'saved'}: ${savedLayer.id}`,
      );
    }
  } catch (error) {
    strapi.log.error(`updateEntrance for ${canton}: error ${error.stack ?? error}`);
  }
}

export async function downloadAndExtractSwissNamesNational(params: {
  url: string;
  lastModified: string;
  tmpDir: string;
  namesFileName: string;
  nationalFileName: string;
}) {
  let success = false;
  const response = await downloadIfChanged(params.url, params.lastModified);
  if (response.buffer) {
    //extract corresponding file from zip and save temporarly (required for upload Service)
    const zip = new AdmZip(response.buffer);
    const targetEntry = zip.getEntry(`${params.namesFileName}.csv`);
    if (!targetEntry) {
      throw new Error(`updateSwissNamesNational: swissNAMES3D zip have no "${params.namesFileName}.csv"`);
    }
    const fileSize = targetEntry.header.size;
    success = zip.extractEntryTo(targetEntry, params.tmpDir, false, true, false, params.nationalFileName);
    return { success, fileSize };
  } else {
    return response;
  }
}

async function updateSwissNamesNational(
  strapi: Core.Strapi,
  url_template: string,
  namesFolder: Folder,
  namesFileName: string,
  styleMedia: Media,
  callWorker: <T>(func: string, params: any) => Promise<T>,
) {
  try {
    const tmpDir: string = strapi.config.get('server.tmpDir') || '/tmp';
    let media: Media;
    let year = new Date().getFullYear();
    while (!media) {
      //check swissNAMES3D file
      const url = renderUrlTemplate(url_template, { year });
      const fileName = `${namesFileName}_${year}.csv`;
      const namesLayerName = `${namesFileName} Siedlungsgebiete (Ganze Schweiz)`;
      let mapLayer: Partial<MapLayer>;
      ({ mapLayer, media } = await findLayerAndMedia(namesLayerName, MapLayerTypes.CSV, fileName, namesFolder));
      const lastModified = formatForIfModifiedSince(media?.updatedAt);
      const nationalFileName = `strapi-${Date.now()}-${Math.random().toString(36).slice(2)}-${fileName}`;
      const response = await callWorker<{
        status?: number;
        lastModified?: string;
        age?: string;
        success?: boolean;
        fileSize?: number;
      }>('downloadAndExtractSwissNamesNational', { url, lastModified, tmpDir, namesFileName, nationalFileName });
      if (response.fileSize) {
        const fullTmpPath = join(tmpDir, nationalFileName);
        if (!response.success) {
          strapi.log.error(`updateSwissNamesNational: extract "${namesFileName}.csv" to "${fullTmpPath}" failed`);
          return;
        }
        try {
          media = await updateOrCreateMedia(strapi, namesFolder, fileName, fullTmpPath, response.fileSize);
          strapi.log.info(`updateSwissNamesNational: media "${fileName}" saved: ${media.id}`);
        } finally {
          if (existsSync(fullTmpPath)) {
            await unlink(fullTmpPath).catch((err) => {
              strapi.log.warn(`updateSwissNamesNational: remove temp file failed: "${fullTmpPath}", ${err}`);
            });
          }
        }
      } else if (response.status === 304) {
        strapi.log.info(`updateSwissNamesNational: content ${year} not changed since: ${response.lastModified}`);
      } else if (response.status === 404) {
        strapi.log.debug(`updateSwissNamesNational: ${year} file not found ${url}`);
      } else {
        throw new Error(`${url}: HTTP ${response.status}`);
      }
      if (media) {
        const savedLayer = await insertOrUpdateSwissNamesMapLayer(mapLayer, namesLayerName, media, styleMedia);
        strapi.log.info(
          `updateSwissNamesNational: maplayer "${namesLayerName}" ${mapLayer ? 'updated' : 'saved'}: ${savedLayer.id}`,
        );
      } else {
        year -= 1;
        if (year < 2025) {
          return;
        }
      }
    }
    return media;
  } catch (error) {
    strapi.log.error(`updateSwissNamesNational: error ${error.stack ?? error}`);
    return null;
  }
}

export async function prepareSwissNamesContent(params: { namesMediaUrl: string; fieldsToKeep: string[] }): Promise<
  SwissNamesRow[]
> {
  const coordConverter = proj4('EPSG:2056', 'EPSG:4326');
  return fetch(params.namesMediaUrl)
    .then((response) => response.text())
    .then((csvContent) => {
      const schema = inferSchema(csvContent);
      const parser = initParser(schema);
      const csvLines = parser.typedObjs(csvContent, (rows, append) => {
        const filteredExtendedRows = [];
        rows.forEach((row) => {
          if (
            isNaN(row[swissNAMES3D_fieldX]) ||
            isNaN(row[swissNAMES3D_fieldY]) ||
            (row[swissNAMES3D_fieldX] === 0 && row[swissNAMES3D_fieldY] === 0)
          ) {
            return;
          }
          const x = parseFloat(row[swissNAMES3D_fieldX]);
          const y = parseFloat(row[swissNAMES3D_fieldY]);
          const newRow: SwissNamesRow = {};
          for (const field of params.fieldsToKeep) {
            newRow[field] = row[field];
          }
          //shpjs does a automatic reprojection to EPSG:4326 - WGS84, the original was EPSG:2056 – CH1903+ / LV95 (as defined in prj file)
          //to allow compare need to reproject namesContent also
          newRow.coord = coordConverter.forward([x, y]);
          filteredExtendedRows.push(newRow);
        });
        append(filteredExtendedRows);
      });
      return csvLines;
    });
}

async function insertOrUpdateSwissNamesMapLayer(
  mapLayer: Partial<MapLayer>,
  namesLayerName: string,
  sourceMedia: Media,
  styleMedia: Media,
) {
  const mapLayerData = {
    label: namesLayerName,
    type: MapLayerTypes.CSV,
    //media is referenced by id not documentId
    media_source: sourceMedia.id,
    public: true,
    options: {
      fieldX: swissNAMES3D_fieldX,
      fieldY: swissNAMES3D_fieldY,
      hidden: false,
      opacity: 1,
      styleUrl: styleMedia?.url,
      attribution: [['swisstopo', 'https://www.swisstopo.admin.ch/de/home.html']],
      delimiter: ';',
      searchable: true,
      styleFormat: 'mapbox',
      dataProjection: 'EPSG:2056',
      styleSourceName: 'swissNAMES3D',
      styleSourceType: 'url',
      filterRegExPattern: [
        ['OBJEKTKLASSE_TLM', 'TLM_SIEDLUNGSNAME', ''],
        ['EINWOHNERKATEGORIE', '.*(?<!< 20)', ''],
      ],
      searchRegExPatterns: [
        ['(?<NAME>.+)', 'u'],
        ['(?<NAME>.+) \\((?<OBJEKTART>.+)\\)', 'u'],
      ],
      searchResultLabelMask: '${NAME} (${OBJEKTART})',
      searchResultGroupingFilterFields: [],
    },
  };
  if (mapLayer) {
    //always set/update all fields to make sure changes in the config/template here are always updated.
    return await strapi.documents('api::map-layer.map-layer').update({
      documentId: mapLayer.documentId,
      data: mapLayerData,
    });
  } else {
    return await strapi.documents('api::map-layer.map-layer').create({
      data: mapLayerData,
    });
  }
}

export async function extractSwissNamesCanton(
  params: {
    tmpDir: string;
    cantonFileName: string;
    fieldsToKeep: string[];
    namesMediaUrl: string;
    cantonFeature: Feature<Polygon | MultiPolygon>;
  },
  nameCache: { names: SwissNamesRow[] },
) {
  let success = false;
  const fullTmpPath = join(params.tmpDir, params.cantonFileName);

  let names = nameCache.names;
  if (!names) {
    names = await prepareSwissNamesContent(params);
    nameCache.names = names;
  }

  const filtered = names.filter((obj) => booleanPointInPolygon(obj.coord, params.cantonFeature));
  if (filtered.length > 0) {
    await exportToCSV(params.fieldsToKeep, filtered, fullTmpPath);
    success = true;
  }

  return { success };
}

async function updateSwissNames(
  strapi: Core.Strapi,
  canton: string,
  mediaFolder: Folder,
  styleMedia: Media,
  namesMediaUpdatedAt: DateTimeValue,
  namesMedia: Media,
  cantonFeature: Feature<Polygon | MultiPolygon>,
  filePrefix: string,
  fieldsToKeep: string[],
  callWorker: <T>(func: string, params: any) => Promise<T>,
) {
  try {
    const namesLayerName = `${filePrefix} Siedlungsgebiete (${canton})`;
    const fileName = `${filePrefix}_removed_cols_${canton}.csv`;
    let { mapLayer, media } = await findLayerAndMedia(namesLayerName, MapLayerTypes.CSV, fileName, mediaFolder);
    const lastModified = media?.updatedAt;

    if (!lastModified || lastModified < namesMediaUpdatedAt) {
      const tmpDir: string = strapi.config.get('server.tmpDir') || '/tmp';
      const cantonFileName = `strapi-${Date.now()}-${Math.random().toString(36).slice(2)}-${fileName}`;
      const namesMediaUrl = getMediaFetchUrl(namesMedia);

      const response = await callWorker<{ success: boolean }>('extractSwissNamesCanton', {
        tmpDir,
        cantonFileName,
        fieldsToKeep,
        namesMediaUrl,
        cantonFeature,
      });
      if (response.success) {
        const fullTmpPath = join(tmpDir, cantonFileName);
        try {
          media = await updateOrCreateMedia(strapi, mediaFolder, fileName, fullTmpPath);
          strapi.log.info(`updateSwissNames for ${canton}: media ${fileName} saved: ${media.id}`);
        } finally {
          if (existsSync(fullTmpPath)) {
            await unlink(fullTmpPath).catch((err) => {
              strapi.log.warn(`updateSwissNames for ${canton}: remove temp file failed: "${fullTmpPath}"`);
            });
          }
        }
      } else {
        strapi.log.error(`updateSwissNames for ${canton}: swissNAMES no data after geo filtering`);
      }
    } else {
      strapi.log.info(`updateSwissNames for ${canton}: swissNAMES not changed since: ${namesMediaUpdatedAt}`);
    }
    if (media) {
      const savedLayer = await insertOrUpdateSwissNamesMapLayer(mapLayer, namesLayerName, media, styleMedia);
      strapi.log.info(
        `updateSwissNames for ${canton}: maplayer "${namesLayerName}" ${mapLayer ? 'updated' : 'saved'}: ${savedLayer.id}`,
      );
    }
  } catch (error) {
    strapi.log.error(`updateSwissNames for ${canton}: error ${error.stack ?? error}`);
  }
}

async function prepareMediaFolders(strapi: Core.Strapi) {
  const parentFolder = await findOrCreateFolder(strapi, 'MapLayer');
  const entrancesFolder = await findOrCreateFolder(strapi, 'entrances', parentFolder);
  const boundariesFolder = await findOrCreateFolder(strapi, 'swissBOUNDARIES3D', parentFolder);
  const namesFolder = await findOrCreateFolder(strapi, 'swissNAMES3D', parentFolder);
  const localitiesFolder = await findOrCreateFolder(strapi, 'localities', parentFolder);
  return { entrancesFolder, boundariesFolder, namesFolder, localitiesFolder };
}

async function uploadStyleIfMissing(strapi: Core.Strapi, folder: Folder, fileLocation: string) {
  const mediaFileName = basename(fileLocation);
  let media = await strapi.documents('plugin::upload.file').findFirst({
    filters: { name: mediaFileName, folder: { documentId: { $eq: folder.documentId } } },
  });
  if (existsSync(fileLocation)) {
    if (!media || new Date(media.updatedAt) < (await stat(fileLocation)).mtime) {
      media = await updateOrCreateMedia(strapi, folder, mediaFileName, fileLocation);
    }
  }
  return media;
}

async function prepareStyleMedias(
  strapi: Core.Strapi,
  entrancesFolder: Folder,
  boundariesFolder: Folder,
  namesFolder: Folder,
  localitiesFolder: Folder,
) {
  const entrancesStyle = await uploadStyleIfMissing(strapi, entrancesFolder, './init/entrances-mapboxstyle.json');
  const boundariesStyle = await uploadStyleIfMissing(
    strapi,
    boundariesFolder,
    './init/swissBOUNDARIES3D-mapboxstyle.json',
  );
  const namesStyle = await uploadStyleIfMissing(strapi, namesFolder, './init/swissNAMES3D_PLY-mapboxstyle.json');
  const localityStyle = await uploadStyleIfMissing(strapi, localitiesFolder, './init/locality-mapboxstyle.json');
  return { entrancesStyle, boundariesStyle, namesStyle, localityStyle };
}

async function configureDefaultStyleMedias(strapi: Core.Strapi, config: any) {
  const { entrancesFolder, boundariesFolder, namesFolder, localitiesFolder } = await prepareMediaFolders(strapi);
  const { entrancesStyle, boundariesStyle, namesStyle, localityStyle } = await prepareStyleMedias(
    strapi,
    entrancesFolder,
    boundariesFolder,
    namesFolder,
    localitiesFolder,
  );
  let allMediasAvailable = true;
  const configUpdate: any = {};
  if (!config.style_entrances) {
    if (entrancesStyle) {
      configUpdate.style_entrances = entrancesStyle.id;
      config.style_entrances = entrancesStyle;
    } else {
      allMediasAvailable = false;
    }
  }
  if (!config.style_swissBOUNDARIES3D) {
    if (boundariesStyle) {
      configUpdate.style_swissBOUNDARIES3D = boundariesStyle.id;
      config.style_swissBOUNDARIES3D = boundariesStyle;
    } else {
      allMediasAvailable = false;
    }
  }
  if (!config.style_swissNAMES3D) {
    if (namesStyle) {
      configUpdate.style_swissNAMES3D = namesStyle.id;
      config.style_swissNAMES3D = namesStyle;
    } else {
      allMediasAvailable = false;
    }
  }
  if (!config.style_locality) {
    if (localityStyle) {
      configUpdate.style_locality = localityStyle.id;
      config.style_locality = localityStyle;
    } else {
      allMediasAvailable = false;
    }
  }

  await strapi.documents('api::map-layer-generation-config.map-layer-generation-config').update({
    documentId: config.documentId,
    data: configUpdate,
  });
  return allMediasAvailable;
}

export async function getAndVerifyMapLayerGenerationConfig(strapi: Core.Strapi) {
  //read and verify config
  const config = await strapi.documents('api::map-layer-generation-config.map-layer-generation-config').findFirst({
    populate: ['style_entrances', 'style_swissBOUNDARIES3D', 'style_swissNAMES3D', 'style_locality'],
  });
  if (!config) {
    throw new Error('updateMapLayerMedias failed: no map-layer-generation-config defined');
  }
  if (!config.enabled) {
    throw new Error('updateMapLayerMedias skipped: update is disabled');
  }
  if (!config.cantons?.trim()) {
    throw new Error('updateMapLayerMedias failed: cantons to update is empty');
  }
  if (config.cantons.split(',')[0].includes(' ')) {
    throw new Error('updateMapLayerMedias failed: cantons need to be splited by ","');
  }

  if (
    !config.style_entrances ||
    !config.style_swissBOUNDARIES3D ||
    !config.style_swissNAMES3D ||
    !config.style_locality
  ) {
    //try to autofix and continue
    const allMediasAvailable = await configureDefaultStyleMedias(strapi, config);
    if (!allMediasAvailable) {
      throw new Error(
        'updateMapLayerMedias failed: style_entrances or style_swissBOUNDARIES3D or style_swissNAMES3D or style_locality not set',
      );
    }
  }
  return config;
}

export async function loadShpFile(mediaUrl: string): Promise<FeatureCollection> {
  return shp(mediaUrl);
}

export async function updateMapLayerMedias(strapi: Core.Strapi) {
  const { callWorker, stopWorker } = startWorker(strapi);
  let configId: string;
  try {
    const config = await getAndVerifyMapLayerGenerationConfig(strapi);
    configId = config.documentId;
    await strapi.documents('api::map-layer-generation-config.map-layer-generation-config').update({
      documentId: configId,
      data: { lastStartDate: new Date(), lastEndDate: null },
    });

    const cantonsToUpdate = config.cantons.trim().toUpperCase().split(',');

    const { entrancesFolder, boundariesFolder, namesFolder, localitiesFolder } = await prepareMediaFolders(strapi);

    //updateSwissBoundaries
    strapi.log.info('updateMapLayerMedias: start update boundaries');
    const boundaries = await updateSwissBoundaries(
      strapi,
      config.url_swissBOUNDARIES3D,
      boundariesFolder,
      config.style_swissBOUNDARIES3D,
      config.create_swissBOUNDARIES3D_municipality,
      callWorker,
    );
    strapi.log.info('updateMapLayerMedias: finished update boundaries');

    let cantonAreasGeoJSON: FeatureCollection;
    let districtAreasGeoJSON: FeatureCollection;
    let municipalityMediaFile: string;
    let municipalityMediaLastModified: DateTimeValue;
    if (boundaries) {
      const { cantonAreasMedia, districtAreasMedia, municipalityAreasMedia } = boundaries;
      cantonAreasGeoJSON = await callWorker('loadShpFile', getMediaFetchUrl(cantonAreasMedia));
      districtAreasGeoJSON = await callWorker('loadShpFile', getMediaFetchUrl(districtAreasMedia));
      municipalityMediaFile = getMediaFetchUrl(municipalityAreasMedia);
      municipalityMediaLastModified = municipalityAreasMedia?.updatedAt;
    }

    if (cantonAreasGeoJSON && config.create_swissBOUNDARIES3D_municipality) {
      //municipality canton split
      strapi.log.info('updateMapLayerMedias: start municipality canton split');
      const municipalityCantonsToUpdate = [...cantonsToUpdate];
      if (municipalityCantonsToUpdate.length >= 20) {
        municipalityCantonsToUpdate.push('LI');
      }

      for (const canton of municipalityCantonsToUpdate) {
        try {
          strapi.log.info(`updateMapLayerMedias: start municipality canton split ${canton}`);
          const cantonFeature = getCantonFeature(cantonAreasGeoJSON, canton);
          await updateMunicipalityCanton(
            strapi,
            canton,
            cantonFeature,
            boundariesFolder,
            config.style_swissBOUNDARIES3D,
            municipalityMediaLastModified,
            municipalityMediaFile,
            callWorker,
          );
          strapi.log.info(`updateMapLayerMedias: finished municipality canton split ${canton}`);
        } catch (error) {
          strapi.log.error(error);
        }
      }
      callWorker('removeFileCache', municipalityMediaFile);
      strapi.log.info('updateMapLayerMedias: finished all municipality canton split');
    } else if (!cantonAreasGeoJSON) {
      strapi.log.error('updateMapLayerMedias: cannot split municipality without boundaries');
    }

    //updateLocality & updateLocalityCanton
    if (cantonAreasGeoJSON && (config.create_locality || config.create_locality_zip)) {
      //updateLocality
      strapi.log.info('updateMapLayerMedias: start update locality');
      const localityResult = await updateLocality(
        strapi,
        config.url_locality,
        localitiesFolder,
        config.style_locality,
        config.create_locality,
        config.create_locality_zip,
        callWorker,
      );
      strapi.log.info('updateMapLayerMedias: finished update locality');
      if (localityResult) {
        const { localityMedia, zipMedia } = localityResult;
        const localityMediaFile = getMediaFetchUrl(localityMedia);
        const localityMediaLastModified = localityMedia?.updatedAt;
        const zipMediaFile = getMediaFetchUrl(zipMedia);
        const zipMediaLastModified = zipMedia?.updatedAt;

        //updateLocalityCanton / locality canton split
        strapi.log.info('updateMapLayerMedias: start locality canton split');

        for (const canton of cantonsToUpdate) {
          try {
            strapi.log.info(`updateMapLayerMedias: start locality canton split ${canton}`);
            const cantonFeature = getCantonFeature(cantonAreasGeoJSON, canton);
            await updateLocalityCanton(
              strapi,
              canton,
              cantonFeature,
              localitiesFolder,
              config.style_locality,
              localityMediaFile,
              localityMediaLastModified,
              zipMediaFile,
              zipMediaLastModified,
              config.create_locality,
              config.create_locality_zip,
              callWorker,
            );
            strapi.log.info(`updateMapLayerMedias: finished locality canton split ${canton}`);
          } catch (error) {
            strapi.log.error(error);
          }
        }
        callWorker('removeFileCache', localityMediaFile);
        callWorker('removeFileCache', zipMediaFile);
        strapi.log.info('updateMapLayerMedias: finished all locality canton split');
      }
    } else if (!cantonAreasGeoJSON) {
      strapi.log.error('updateMapLayerMedias: cannot split locality without boundaries');
    }

    //updateEntrance
    strapi.log.info('updateMapLayerMedias: start updateEntrance');
    for (const canton of cantonsToUpdate) {
      try {
        strapi.log.info(`updateMapLayerMedias: start updateEntrance ${canton}`);
        const cantonFeature = getCantonFeature(cantonAreasGeoJSON, canton);
        const districtFeaures = getDistrictFeatures(cantonFeature, districtAreasGeoJSON);
        await updateEntrance(
          strapi,
          config.url_madd,
          canton,
          entrancesFolder,
          config.style_entrances,
          config.allwaysCreateDistrict,
          districtFeaures,
          callWorker,
        );
        strapi.log.info(`updateMapLayerMedias: finished updateEntrance ${canton}`);
      } catch (error) {
        strapi.log.error(error);
      }
    }
    strapi.log.info('updateMapLayerMedias: finished all updateEntrance');

    //updateSwissNamesNational
    strapi.log.info('updateMapLayerMedias: start updateSwissNamesNational');
    const namesMedia = await updateSwissNamesNational(
      strapi,
      config.url_swissNAMES3D,
      namesFolder,
      config.file_swissNAMES3D,
      config.style_swissNAMES3D,
      callWorker,
    );
    strapi.log.info('updateMapLayerMedias: finished updateSwissNamesNational');

    //updateSwissNames
    if (cantonAreasGeoJSON) {
      if (namesMedia?.url) {
        strapi.log.info('updateMapLayerMedias: start updateSwissNames');
        const fieldsToKeep = config.fields_swissNAMES3D.trim().split(',');

        for (const canton of cantonsToUpdate) {
          try {
            strapi.log.info(`updateMapLayerMedias: start updateSwissNames ${canton}`);
            const cantonFeature = getCantonFeature(cantonAreasGeoJSON, canton);
            await updateSwissNames(
              strapi,
              canton,
              namesFolder,
              config.style_swissNAMES3D,
              namesMedia.updatedAt,
              namesMedia,
              cantonFeature,
              config.file_swissNAMES3D,
              fieldsToKeep,
              callWorker,
            );
            strapi.log.info(`updateMapLayerMedias: finished updateSwissNames ${canton}`);
          } catch (error) {
            strapi.log.error(error);
          }
        }
        strapi.log.info('updateMapLayerMedias: finished all updateSwissNames');
      } else {
        strapi.log.error('updateMapLayerMedias: swissNames not loaded');
      }
    } else {
      strapi.log.error('updateMapLayerMedias: cannot split swissNames without boundaries');
    }
  } catch (error) {
    strapi.log.error(error);
  }
  if (configId) {
    await strapi.documents('api::map-layer-generation-config.map-layer-generation-config').update({
      documentId: configId,
      data: { lastEndDate: new Date() },
    });
  }
  strapi.log.info('updateMapLayerMedias: finished all mapLayer updates');
  await stopWorker();
}

function startWorker(strapi: Core.Strapi) {
  const worker = new Worker('./dist/src/workers/map-layer-processor.js');

  const pendingRequests = new Map<
    number,
    { resolve: (value: any | PromiseLike<any>) => void; reject: (reason?: any) => void; func: string }
  >();
  let requestId = 0;

  worker.on('message', (msg) => {
    if (msg.type === 'LOG') {
      strapi.log[msg.level ?? 'info'](msg.message);
      return;
    }
    if (!msg.id) {
      strapi.log.error('Worker message without id:' + JSON.stringify(msg));
      return;
    }
    const request = pendingRequests.get(msg.id);
    if (!request) {
      strapi.log.error(`Worker message id ${msg.id} (func:${msg.func}) not found in pending requests.`);
      return;
    }
    pendingRequests.delete(msg.id);
    const { resolve, reject } = request;
    if (msg.type === 'RESULT') {
      strapi.log.info(`Worker response for id ${msg.id} (func:${msg.func}) recived.`);
      resolve(msg.value);
    } else if (msg.type === 'ERROR') {
      strapi.log.error(`Worker returned error for id ${msg.id} (func:${msg.func}):` + JSON.stringify(msg.value));
      if (msg.value.stack) {
        reject(msg.value.stack);
      } else if (msg.value.error) {
        reject(msg.value.error);
      } else {
        reject(msg.value);
      }
    }
  });

  worker.on('error', (error) => {
    strapi.log.error('Worker Error:' + JSON.stringify(error));
  });

  const callWorker = <T>(func: string, params: any) => {
    const id = ++requestId;
    return new Promise<T>((resolve, reject) => {
      pendingRequests.set(id, { resolve, reject, func });

      worker.postMessage({
        id,
        func: func,
        params: params,
      });

      // 6min Timeout
      setTimeout(() => {
        const req = pendingRequests.get(id);
        if (req) {
          pendingRequests.delete(id);
          strapi.log.error(`Worker timeout for id ${id} (func:${func})`);
          req.reject(new Error('worker call timeout'));
        }
      }, 360000);
    });
  };

  const stopWorker = async () => {
    await callWorker('shutdown', null);
    pendingRequests.forEach((req, id) => {
      strapi.log.warn(`Worker shutdown but there was pendingRequests ${id}, func: ${req.func}`);
      req.reject(new Error('worker terminated'));
    });
    await worker.terminate();
  };

  return { callWorker, stopWorker };
}
