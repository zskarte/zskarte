import { readFile, writeFile } from 'node:fs/promises';
import { basename, isAbsolute, join, resolve } from 'node:path';
import { isMainThread, parentPort } from 'node:worker_threads';
import { writeToString } from '@fast-csv/format';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import AdmZip from 'adm-zip';
import proj4 from 'proj4';
import shp from 'shpjs';
import { inferSchema, initParser } from 'udsv';

const storageLocalDir = process.env.STORAGE_LOCAL_DIR ?? 'public/uploads';
export const uploadsDirectory = isAbsolute(storageLocalDir)
  ? storageLocalDir
  : resolve(process.cwd(), storageLocalDir);

proj4.defs(
  'EPSG:2056',
  '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs',
);

const ENTRANCE_TO_BIG_SIZE = 50_000_000;
const ENTRANCE_NEED_SPLIT_SIZE = 25_000_000;

export interface SwissNamesRow {
  coord: [number, number];
  [key: string]: unknown;
}

const cantonFileCache = new Map<string, any>();
const nameCache: { names: SwissNamesRow[] | null } = { names: null };

export async function downloadIfChanged(
  url: string,
  lastModified?: string | null,
): Promise<{ buffer?: Buffer; status: number; lastModified?: string | null; age?: string | null }> {
  const headers: Record<string, string> = {};
  if (lastModified) {
    headers['If-Modified-Since'] = lastModified;
  }

  const response = await fetch(url, { headers });
  const newLastModified = response.headers.get('last-modified');
  const age = response.headers.get('age');

  if (response.status === 304) {
    return {
      status: 304,
      lastModified: newLastModified || lastModified,
      age,
    };
  }

  if (!response.ok) {
    return {
      status: response.status,
      lastModified: newLastModified || lastModified,
      age,
    };
  }

  const arrayBuffer = await response.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    status: response.status,
    lastModified: newLastModified || lastModified,
    age,
  };
}

export function extractFilesToNewZip(
  inputZip: AdmZip,
  filterBasename: string,
  outputPath: string,
): AdmZip | null {
  const outZip = new AdmZip();
  let foundFiles = 0;
  for (const entry of inputZip.getEntries()) {
    const entryBaseName = basename(entry.entryName);
    if (entryBaseName.startsWith(filterBasename)) {
      outZip.addFile(entry.entryName, entry.getData());
      foundFiles++;
    }
  }

  if (foundFiles > 0) {
    outZip.writeZip(outputPath);
    return outZip;
  }
  return null;
}

export async function downloadAndExtractSwissBoundaries(params: {
  url: string;
  lastModified?: string | null;
  tmpDir: string;
  cantonFile: string;
  districtFile: string;
}): Promise<{
  status: number;
  cantonSuccess?: boolean;
  districtSuccess?: boolean;
  lastModified?: string | null;
  age?: string | null;
}> {
  const result = await downloadIfChanged(params.url, params.lastModified);
  if (result.status === 304 || !result.buffer) {
    return {
      status: result.status,
      lastModified: result.lastModified,
      age: result.age,
    };
  }

  const zip = new AdmZip(result.buffer);
  const cantonZip = extractFilesToNewZip(
    zip,
    'swissBOUNDARIES3D_1_5_TLM_KANTONSGEBIET',
    join(params.tmpDir, params.cantonFile),
  );
  const districtZip = extractFilesToNewZip(
    zip,
    'swissBOUNDARIES3D_1_5_TLM_BEZIRKSGEBIET',
    join(params.tmpDir, params.districtFile),
  );

  return {
    status: result.status,
    cantonSuccess: cantonZip !== null,
    districtSuccess: districtZip !== null,
    lastModified: result.lastModified,
    age: result.age,
  };
}

export async function loadShpFile(source: string | Buffer): Promise<any> {
  let buffer: Buffer;
  if (Buffer.isBuffer(source)) {
    buffer = source;
  } else if (typeof source === 'string') {
    if (source.startsWith('http://') || source.startsWith('https://')) {
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`Failed to fetch shapefile from ${source}: ${response.statusText}`);
      }
      buffer = Buffer.from(await response.arrayBuffer());
    } else {
      let filePath = source;
      if (filePath.startsWith('/uploads/')) {
        filePath = join(uploadsDirectory, filePath.slice('/uploads/'.length));
      }
      buffer = await readFile(filePath);
    }
  } else {
    throw new Error('Invalid source provided for loadShpFile');
  }

  const parsed = await shp(buffer);
  return Array.isArray(parsed) ? parsed[0] : parsed;
}

export async function downloadAndExtractEntrance(params: {
  url: string;
  lastModified?: string | null;
  tmpDir: string;
  canton: string;
  cantonFile: string;
  allwaysCreateDistrict: boolean;
}): Promise<{
  status: number;
  fileToBig?: boolean;
  cantonSuccess?: boolean;
  fileSize?: number;
  lastModified?: string | null;
  age?: string | null;
}> {
  const result = await downloadIfChanged(params.url, params.lastModified);
  if (result.status === 304 || !result.buffer) {
    return {
      status: result.status,
      lastModified: result.lastModified,
      age: result.age,
    };
  }

  const zip = new AdmZip(result.buffer);
  const targetEntry = zip.getEntry('entrances.geojson');
  if (!targetEntry) {
    throw new Error(`Entrance file 'entrances.geojson' not found in archive for ${params.canton}`);
  }

  const fileSize = targetEntry.header.size;
  const fileToBig = fileSize > ENTRANCE_TO_BIG_SIZE;
  let cantonSuccess = false;

  if (!fileToBig) {
    const data = targetEntry.getData();
    await writeFile(join(params.tmpDir, params.cantonFile), data);
    cantonSuccess = true;
  }

  const fileNeedSplit = fileSize > ENTRANCE_NEED_SPLIT_SIZE;
  if (params.allwaysCreateDistrict || fileNeedSplit) {
    const geojsonText = targetEntry.getData().toString('utf8');
    const fullTmpPath = join(params.tmpDir, params.cantonFile);
    cantonFileCache.set(fullTmpPath, JSON.parse(geojsonText));
  }

  return {
    status: 200,
    fileToBig,
    cantonSuccess,
    fileSize,
    lastModified: result.lastModified,
    age: result.age,
  };
}

export async function extractEntranceDistrict(params: {
  district: any;
  cantonFile: string;
  tmpDir: string;
  districtFile: string;
}): Promise<{ districtSuccess: boolean; featureCount: number }> {
  let geojson = cantonFileCache.get(params.cantonFile);
  if (!geojson) {
    if (params.cantonFile.startsWith('http://') || params.cantonFile.startsWith('https://')) {
      const response = await fetch(params.cantonFile);
      geojson = await response.json();
    } else {
      let filePath = params.cantonFile;
      if (filePath.startsWith('/uploads/')) {
        filePath = join(uploadsDirectory, filePath.slice('/uploads/'.length));
      }
      const raw = await readFile(filePath, 'utf-8');
      geojson = JSON.parse(raw);
    }
  }

  if (!geojson || !Array.isArray(geojson.features)) {
    throw new Error(`Invalid GeoJSON features for canton file: ${params.cantonFile}`);
  }

  let coordConverter = {
    forward: (coords: number[]) => coords,
  };

  const crsName = geojson.crs?.properties?.name;
  if (crsName) {
    const match = String(crsName).match(/(\d+)\s*$/);
    if (match?.[1] && match[1] !== '4326') {
      const proj = proj4('EPSG:' + match[1], 'EPSG:4326');
      coordConverter = {
        forward: (c: number[]) => proj.forward(c),
      };
    }
  }

  const filteredFeatures = geojson.features.filter((feature: any) => {
    if (feature.geometry?.type === 'Point' && Array.isArray(feature.geometry.coordinates)) {
      const point4326 = coordConverter.forward(feature.geometry.coordinates);
      return booleanPointInPolygon(point4326, params.district);
    }
    return false;
  });

  if (filteredFeatures.length > 0) {
    const newCollection = {
      type: 'FeatureCollection',
      crs: {
        type: 'name',
        properties: { name: 'urn:ogc:def:crs:EPSG::2056' },
      },
      features: filteredFeatures,
    };
    const outPath = join(params.tmpDir, params.districtFile);
    await writeFile(outPath, JSON.stringify(newCollection), 'utf-8');
    return { districtSuccess: true, featureCount: filteredFeatures.length };
  }

  return { districtSuccess: false, featureCount: 0 };
}

export function extractEntranceDistrictEnd(params: { cantonFile: string }): { success: boolean } {
  cantonFileCache.delete(params.cantonFile);
  return { success: true };
}

export async function downloadAndExtractSwissNamesNational(params: {
  url: string;
  lastModified?: string | null;
  tmpDir: string;
  namesFileName: string;
  nationalFileName: string;
}): Promise<{
  status: number;
  success?: boolean;
  fileSize?: number;
  lastModified?: string | null;
  age?: string | null;
}> {
  const result = await downloadIfChanged(params.url, params.lastModified);
  if (result.status === 304 || !result.buffer) {
    return {
      status: result.status,
      lastModified: result.lastModified,
      age: result.age,
    };
  }

  const zip = new AdmZip(result.buffer);
  const targetEntry = zip.getEntry(`${params.namesFileName}.csv`);
  if (!targetEntry) {
    throw new Error(`Entry ${params.namesFileName}.csv not found in archive`);
  }

  const data = targetEntry.getData();
  await writeFile(join(params.tmpDir, params.nationalFileName), data);

  return {
    status: 200,
    success: true,
    fileSize: targetEntry.header.size,
    lastModified: result.lastModified,
    age: result.age,
  };
}

export async function prepareSwissNamesContent(params: {
  namesMediaUrl: string;
  fieldsToKeep: string[];
}): Promise<SwissNamesRow[]> {
  let content: string;
  if (params.namesMediaUrl.startsWith('http://') || params.namesMediaUrl.startsWith('https://')) {
    const response = await fetch(params.namesMediaUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch names from ${params.namesMediaUrl}: ${response.statusText}`);
    }
    content = await response.text();
  } else {
    let filePath = params.namesMediaUrl;
    if (filePath.startsWith('/uploads/')) {
      filePath = join(uploadsDirectory, filePath.slice('/uploads/'.length));
    }
    content = await readFile(filePath, 'utf-8');
  }

  const schema = inferSchema(content);
  const parser = initParser(schema);
  const rows: SwissNamesRow[] = [];
  const coordConverter = proj4('EPSG:2056', 'EPSG:4326');

  parser.typedObjs(content, (parsedRows: Record<string, unknown>[]) => {
    for (const row of parsedRows) {
      const x = Number(row['E']);
      const y = Number(row['N']);
      if (Number.isNaN(x) || Number.isNaN(y) || (x === 0 && y === 0)) {
        continue;
      }
      const coord = coordConverter.forward([x, y]) as [number, number];
      const filteredRow: Record<string, unknown> = { coord };
      for (const field of params.fieldsToKeep) {
        filteredRow[field] = row[field];
      }
      rows.push(filteredRow as SwissNamesRow);
    }
  });

  return rows;
}

export async function extractSwissNamesCanton(params: {
  tmpDir: string;
  cantonFileName: string;
  fieldsToKeep: string[];
  namesMediaUrl: string;
  cantonFeature: any;
}): Promise<{ success: boolean; count: number }> {
  if (!nameCache.names) {
    nameCache.names = await prepareSwissNamesContent({
      namesMediaUrl: params.namesMediaUrl,
      fieldsToKeep: params.fieldsToKeep,
    });
  }

  const filtered = nameCache.names.filter((row) =>
    booleanPointInPolygon(row.coord, params.cantonFeature),
  );

  if (filtered.length > 0) {
    const csvRows = filtered.map((row) => {
      const item = { ...row };
      delete (item as any).coord;
      return item;
    });

    const csvContent = await writeToString(csvRows, {
      delimiter: ';',
      headers: params.fieldsToKeep,
    });

    const outPath = join(params.tmpDir, params.cantonFileName);
    await writeFile(outPath, csvContent, 'utf-8');
    return { success: true, count: filtered.length };
  }

  return { success: false, count: 0 };
}

export function resetWorkerCaches(): void {
  cantonFileCache.clear();
  nameCache.names = null;
}

// Worker message listener when running as a Worker thread
if (!isMainThread && parentPort) {
  const port = parentPort;
  port.on('message', async (data: { id: number; func: string; params: any }) => {
    try {
      let result: unknown;
      switch (data.func) {
        case 'downloadAndExtractSwissBoundaries':
          result = await downloadAndExtractSwissBoundaries(data.params);
          break;
        case 'loadShpFile':
          result = await loadShpFile(data.params);
          break;
        case 'downloadAndExtractEntrance':
          result = await downloadAndExtractEntrance(data.params);
          break;
        case 'extractEntranceDistrict':
          result = await extractEntranceDistrict(data.params);
          break;
        case 'extractEntranceDistrictEnd':
          result = extractEntranceDistrictEnd(data.params);
          break;
        case 'downloadAndExtractSwissNamesNational':
          result = await downloadAndExtractSwissNamesNational(data.params);
          break;
        case 'prepareSwissNamesContent':
          result = await prepareSwissNamesContent(data.params);
          break;
        case 'extractSwissNamesCanton':
          result = await extractSwissNamesCanton(data.params);
          break;
        case 'resetCaches':
          resetWorkerCaches();
          result = { success: true };
          break;
        case 'shutdown':
          port.postMessage({ type: 'RESULT', id: data.id, func: data.func, value: 'ok' });
          process.exit(0);
          return;
        default:
          throw new Error(`Unknown worker function: ${data.func}`);
      }
      port.postMessage({ type: 'RESULT', id: data.id, func: data.func, value: result });
    } catch (error: any) {
      port.postMessage({
        type: 'ERROR',
        id: data.id,
        func: data.func,
        value: { error: error?.message ?? String(error), stack: error?.stack },
      });
    }
  });
}
