import { readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import { and, eq, isNull } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { type FileRow, files } from '../file/schema.js';
import { getFileById, replaceFile, uploadFile } from '../file/service.js';
import { getStorageProvider, type StorageProvider } from '../file/storage.js';
import { type MapLayerRow, mapLayers } from '../map-layer/schema.js';
import { getConfig, initOrGetConfig, updateConfig } from './repository.js';
import type { MapLayerGenerationConfigRow } from './schema.js';
import type { LoggerLike } from '@zskarte/types';

export const CANTON_NAMES: Record<string, string> = {
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

export function formatForIfModifiedSince(timestamp: Date | number | string | null | undefined): string | null {
  if (!timestamp) return null;
  let date: Date;
  if (typeof timestamp === 'number') {
    date = new Date(timestamp * 1000);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toUTCString();
}

export function renderUrlTemplate(tmpl: string, data: Record<string, unknown>): string {
  return tmpl.replace(/\$\{(\w+)\}/g, (_, key) => (key in data ? String(data[key]) : ''));
}

export const MIN_SOURCE_YEAR = 2025;

export function getBoundaryArchivePeriods(
  startDate: Date = new Date(),
  minimumYear = MIN_SOURCE_YEAR,
): Array<{ year: string; month: string }> {
  const periods: Array<{ year: string; month: string }> = [];
  let year = startDate.getFullYear();
  let month = startDate.getMonth() + 1;

  while (year >= minimumYear) {
    periods.push({ year: String(year), month: String(month).padStart(2, '0') });
    month -= 1;
    if (month === 0) {
      year -= 1;
      month = 12;
    }
  }

  return periods;
}

export function getSwissNamesArchiveYears(startDate: Date = new Date(), minimumYear = MIN_SOURCE_YEAR): string[] {
  const years: string[] = [];
  for (let year = startDate.getFullYear(); year >= minimumYear; year -= 1) {
    years.push(String(year));
  }
  return years;
}

export function getCantonFeature(cantonGeoJSON: any, canton: string): any | null {
  if (!cantonGeoJSON?.features) return null;
  const cantonName = CANTON_NAMES[canton.toUpperCase()];
  return cantonGeoJSON.features.find((feature: any) => feature.properties?.NAME === cantonName) ?? null;
}

export function getDistrictFeatures(cantonFeature: any, districtGeoJSON: any): any[] {
  if (!cantonFeature || !districtGeoJSON?.features) return [];
  const cantonNumber = cantonFeature.properties?.KANTONSNUM;
  return districtGeoJSON.features.filter((feature: any) => feature.properties?.KANTONSNUM === cantonNumber);
}

export const ENTRANCE_SEARCH_REGEX_PATTERNS: [string, string][] = [
  [
    '(?<streetName>\\p{L}+(?:[ -]\\p{L}+)*) (?<entranceNumber>\\d+ ?\\p{L}?),? (?<zip>\\d\\d\\d\\d) (?<locality>\\p{L}+(?: \\p{L}+)*)',
    'u',
  ],
  ['(?<streetName>\\p{L}+(?:[ -]\\p{L}+)*) (?<entranceNumber>\\d+ ?\\p{L}?),? (?<locality>\\p{L}+(?: \\p{L}+)*)', 'u'],
  ['(?<streetName>\\p{L}+(?:[ -]\\p{L}+)*) (?<entranceNumber>\\d+ ?\\p{L}?),? (?<zip>\\d{1,4})', 'u'],
  ['(?<streetName>\\p{L}+(?:[ -]\\p{L}+)*) (?<entranceNumber>\\d+\\p{L}?)', 'u'],
  ['(?<streetName>\\p{L}+(?:[ -]\\p{L}+)*),? (?<locality>\\p{L}+(?:[ .-]\\p{L}+)*?)', 'u'],
  ['(?<streetName>\\p{L}+(?:[ -]\\p{L}+)*)', 'u'],
  ['(?<entranceNumber>\\d+ ?\\p{L}?),? (?<zip>\\d\\d\\d\\d) (?<locality>\\p{L}+(?:[ .-]\\p{L}+)*)', 'u'],
  ['(?<entranceNumber>\\d+ ?\\p{L}?),? (?<locality>\\p{L}+(?:[ .-]\\p{L}+)*)', 'u'],
];

export function getWorkerLocation(): URL {
  const currentUrl = new URL(import.meta.url);
  if (currentUrl.pathname.endsWith('.ts')) {
    return new URL('./worker.ts', import.meta.url);
  }
  return new URL('./worker.js', import.meta.url);
}

export class WorkerClient {
  private worker: Worker;
  private messageId = 0;
  private pending = new Map<number, { resolve: (value: any) => void; reject: (reason: any) => void }>();
  private logger?: LoggerLike;

  constructor(logger?: LoggerLike) {
    this.logger = logger;
    const workerUrl = getWorkerLocation();
    const isTs = workerUrl.pathname.endsWith('.ts');
    this.worker = new Worker(workerUrl, {
      execArgv: isTs ? ['--import', 'tsx'] : process.execArgv,
    });

    this.worker.on('message', (data: { type: string; id: number; func: string; value: any }) => {
      const handler = this.pending.get(data.id);
      if (!handler) return;
      this.pending.delete(data.id);

      if (data.type === 'RESULT') {
        handler.resolve(data.value);
      } else {
        const err = new Error(data.value?.error ?? 'Unknown worker error');
        if (data.value?.stack) err.stack = data.value.stack;
        handler.reject(err);
      }
    });

    this.worker.on('error', (err) => {
      this.logger?.error({ err }, 'Map layer worker error');
      for (const handler of this.pending.values()) {
        handler.reject(err);
      }
      this.pending.clear();
    });

    this.worker.on('exit', (code) => {
      if (code !== 0 && this.pending.size > 0) {
        const err = new Error(`Worker stopped unexpectedly with exit code ${code}`);
        for (const handler of this.pending.values()) {
          handler.reject(err);
        }
        this.pending.clear();
      }
    });
  }

  async call<T = any>(func: string, params?: any): Promise<T> {
    const id = ++this.messageId;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({ id, func, params });
    });
  }

  async stop(): Promise<void> {
    try {
      await this.call('shutdown');
    } catch {
      // Ignore errors on shutdown
    } finally {
      await this.worker.terminate();
    }
  }
}

export const findStyleFilePath = (fileName: string): string | null => {
  const candidate = join(process.cwd(), 'init', fileName);
  if (existsSync(candidate)) {
    return candidate;
  }
  return null;
};

export const updateOrCreateMedia = async (
  db: Database,
  fileName: string,
  buffer: Buffer,
  mimeType: string,
  folderPath: string,
  storageProvider?: StorageProvider,
): Promise<FileRow> => {
  const [existing] = await db
    .select()
    .from(files)
    .where(and(eq(files.name, fileName), eq(files.folderPath, folderPath)))
    .limit(1);

  if (existing) {
    return await replaceFile(
      db,
      existing.documentId,
      {
        fileName,
        buffer,
        mimeType,
        folderPath,
      },
      storageProvider,
    );
  }

  return await uploadFile(
    db,
    {
      fileName,
      buffer,
      mimeType,
      folderPath,
    },
    storageProvider,
  );
};

export const ensureStyleFile = async (
  db: Database,
  config: MapLayerGenerationConfigRow,
  styleKey: 'styleEntrancesId' | 'styleSwissBoundaries3dId' | 'styleSwissNames3dId',
  fileName: string,
  folderPath = '/MapLayer',
  storageProvider?: StorageProvider,
  logger?: LoggerLike,
): Promise<FileRow | null> => {
  const existingId = config[styleKey];
  if (existingId) {
    const file = await getFileById(db, existingId);
    if (file) return file;
  }

  const [existingByName] = await db
    .select()
    .from(files)
    .where(and(eq(files.name, fileName), eq(files.folderPath, folderPath)))
    .limit(1);

  if (existingByName) {
    await updateConfig(db, config.documentId, { [styleKey]: existingByName.documentId });
    return existingByName;
  }

  const filePath = findStyleFilePath(fileName);
  if (!filePath) {
    logger?.warn(`Style file ${fileName} could not be found to seed.`);
    return null;
  }

  const buffer = await readFile(filePath);
  const uploaded = await uploadFile(
    db,
    {
      fileName,
      buffer,
      mimeType: 'application/json',
      folderPath,
    },
    storageProvider,
  );

  await updateConfig(db, config.documentId, { [styleKey]: uploaded.documentId });
  return uploaded;
};

export const DEFAULT_STYLE_FILES: Array<{
  fileName: string;
  styleKey?: 'styleEntrancesId' | 'styleSwissBoundaries3dId' | 'styleSwissNames3dId';
}> = [
  { fileName: 'entrances-mapboxstyle.json', styleKey: 'styleEntrancesId' },
  { fileName: 'swissBOUNDARIES3D-mapboxstyle.json', styleKey: 'styleSwissBoundaries3dId' },
  { fileName: 'swissNAMES3D_PLY-mapboxstyle.json', styleKey: 'styleSwissNames3dId' },
  { fileName: 'entrances-olstyle.json' },
];

export async function seedDefaultStyleAssets(
  db: Database,
  options: {
    storageProvider?: StorageProvider;
    logger?: LoggerLike;
  } = {},
): Promise<{ seeded: FileRow[]; config: MapLayerGenerationConfigRow }> {
  const logger = options.logger ?? console;
  const storageProvider = options.storageProvider ?? getStorageProvider();
  const config = await initOrGetConfig(db);
  const seeded: FileRow[] = [];

  for (const style of DEFAULT_STYLE_FILES) {
    if (style.styleKey) {
      const file = await ensureStyleFile(
        db,
        config,
        style.styleKey,
        style.fileName,
        '/MapLayer',
        storageProvider,
        logger,
      );
      if (file) {
        seeded.push(file);
      }
    } else {
      const [existing] = await db
        .select()
        .from(files)
        .where(and(eq(files.name, style.fileName), eq(files.folderPath, '/MapLayer')))
        .limit(1);

      if (existing) {
        seeded.push(existing);
      } else {
        const filePath = findStyleFilePath(style.fileName);
        if (filePath) {
          const buffer = await readFile(filePath);
          const uploaded = await uploadFile(
            db,
            {
              fileName: style.fileName,
              buffer,
              mimeType: 'application/json',
              folderPath: '/MapLayer',
            },
            storageProvider,
          );
          seeded.push(uploaded);
        } else {
          logger.warn(`Style file ${style.fileName} could not be found to seed.`);
        }
      }
    }
  }

  const updatedConfig = (await getConfig(db)) ?? config;
  return { seeded, config: updatedConfig };
}

export interface UpsertMapLayerParams {
  label: string;
  type: NonNullable<MapLayerRow['type']>;
  mediaSourceId: string;
  options: Record<string, unknown>;
}

export const upsertMapLayer = async (db: Database, params: UpsertMapLayerParams): Promise<MapLayerRow> => {
  const [existing] = await db
    .select()
    .from(mapLayers)
    .where(and(eq(mapLayers.label, params.label), eq(mapLayers.type, params.type), isNull(mapLayers.organizationId)))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(mapLayers)
      .set({
        label: params.label,
        type: params.type,
        mediaSourceId: params.mediaSourceId,
        public: true,
        options: params.options,
        updatedAt: new Date(),
      })
      .where(eq(mapLayers.documentId, existing.documentId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(mapLayers)
    .values({
      label: params.label,
      type: params.type,
      mediaSourceId: params.mediaSourceId,
      public: true,
      organizationId: null,
      options: params.options,
    })
    .returning();
  return created;
};

export async function updateSwissBoundariesMedia(
  db: Database,
  workerClient: WorkerClient,
  config: MapLayerGenerationConfigRow,
  styleMedia: FileRow | null,
  storageProvider?: StorageProvider,
  logger?: LoggerLike,
  tmpDir: string = os.tmpdir(),
  now: Date = new Date(),
): Promise<{ cantonAreasMedia: FileRow | null; districtAreasMedia: FileRow | null }> {
  const folderPath = '/MapLayer/swissBOUNDARIES3D';
  const boundaryOptions = {
    hidden: false,
    opacity: 1,
    styleUrl: styleMedia?.url,
    searchable: true,
    attribution: [['swisstopo', 'https://www.swisstopo.admin.ch/de/home.html']],
    styleFormat: 'mapbox',
    styleSourceName: 'swissBOUNDARIES3D',
    styleSourceType: 'url',
    searchRegExPatterns: [['(?<NAME>\\p{L}+(?:[ -]\\p{L}+)*)', 'u']],
    searchResultLabelMask: '${NAME}',
    searchResultGroupingFilterFields: [],
  };

  for (const { year, month } of getBoundaryArchivePeriods(now)) {
    const cantonFileName = `swissBOUNDARIES3D_KANTONSGEBIET_${year}_${month}.zip`;
    const districtFileName = `swissBOUNDARIES3D_BEZIRKSGEBIET_${year}_${month}.zip`;
    const [existingCantonMedia] = await db
      .select()
      .from(files)
      .where(and(eq(files.name, cantonFileName), eq(files.folderPath, folderPath)))
      .limit(1);
    const [existingDistrictMedia] = await db
      .select()
      .from(files)
      .where(and(eq(files.name, districtFileName), eq(files.folderPath, folderPath)))
      .limit(1);
    const lastModified =
      existingCantonMedia?.updatedAt ? formatForIfModifiedSince(existingCantonMedia.updatedAt) : null;
    const url = renderUrlTemplate(config.urlSwissBoundaries3d, { year, month });

    logger?.info(`Downloading SwissBoundaries3D from: ${url}`);
    const result = await workerClient.call<{
      status: number;
      cantonSuccess?: boolean;
      districtSuccess?: boolean;
    }>('downloadAndExtractSwissBoundaries', {
      url,
      lastModified,
      tmpDir,
      cantonFile: cantonFileName,
      districtFile: districtFileName,
    });

    if (result.status === 404) {
      logger?.info(`SwissBoundaries3D ${year}_${month} file not found; trying the previous archive.`);
      continue;
    }
    if (result.status !== 304 && result.status >= 400) {
      throw new Error(`${url}: HTTP ${result.status}`);
    }

    let cantonMedia = existingCantonMedia ?? null;
    let districtMedia = existingDistrictMedia ?? null;
    if (result.status !== 304) {
      if (result.cantonSuccess) {
        const cantonFilePath = join(tmpDir, cantonFileName);
        cantonMedia = await updateOrCreateMedia(
          db,
          cantonFileName,
          await readFile(cantonFilePath),
          'application/zip',
          folderPath,
          storageProvider,
        );
        await rm(cantonFilePath, { force: true });
      }
      if (result.districtSuccess) {
        const districtFilePath = join(tmpDir, districtFileName);
        districtMedia = await updateOrCreateMedia(
          db,
          districtFileName,
          await readFile(districtFilePath),
          'application/zip',
          folderPath,
          storageProvider,
        );
        await rm(districtFilePath, { force: true });
      }
    } else {
      logger?.info(`SwissBoundaries3D archive ${year}_${month} not modified (304).`);
    }

    // The canton archive is the anchor for the legacy retry loop. A response
    // without canton data must not prevent trying an older published archive.
    if (!cantonMedia) continue;

    await upsertMapLayer(db, {
      label: 'Kantonsgrenzen',
      type: 'shape',
      mediaSourceId: cantonMedia.documentId,
      options: boundaryOptions,
    });
    if (districtMedia) {
      await upsertMapLayer(db, {
        label: 'Bezirksgrenzen',
        type: 'shape',
        mediaSourceId: districtMedia.documentId,
        options: boundaryOptions,
      });
    }
    return { cantonAreasMedia: cantonMedia, districtAreasMedia: districtMedia };
  }

  return { cantonAreasMedia: null, districtAreasMedia: null };
}

export async function updateEntranceMedia(
  db: Database,
  workerClient: WorkerClient,
  config: MapLayerGenerationConfigRow,
  styleMedia: FileRow | null,
  cantons: string[],
  districtGeoJSON: any,
  storageProvider?: StorageProvider,
  logger?: LoggerLike,
  tmpDir: string = os.tmpdir(),
  cantonGeoJSON: any = null,
): Promise<void> {
  const folderPath = '/MapLayer/entrances';

  for (const canton of cantons) {
    const cantonFile = `entrances_${canton}.geojson`;
    const [existingMedia] = await db
      .select()
      .from(files)
      .where(and(eq(files.name, cantonFile), eq(files.folderPath, folderPath)))
      .limit(1);

    const lastModified = existingMedia?.updatedAt ? formatForIfModifiedSince(existingMedia.updatedAt) : null;
    const url = renderUrlTemplate(config.urlMadd, { canton: canton.toLowerCase() });

    logger?.info(`Downloading entrances for canton ${canton} from: ${url}`);
    const result = await workerClient.call<{
      status: number;
      fileToBig?: boolean;
      cantonSuccess?: boolean;
      fileSize?: number;
    }>('downloadAndExtractEntrance', {
      url,
      lastModified,
      tmpDir,
      canton,
      cantonFile,
      allwaysCreateDistrict: config.allwaysCreateDistrict,
    });

    const entranceOptions = {
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
      searchRegExPatterns: ENTRANCE_SEARCH_REGEX_PATTERNS,
      searchResultLabelMask: '${streetName} ${entranceNumber}, ${zip} ${locality}',
      searchResultGroupingFilterFields: ['zip', 'locality', 'streetName'],
    };

    if (result.status === 304) {
      logger?.info(`Entrances for canton ${canton} not modified (304).`);
    } else if (result.cantonSuccess) {
      const cantonFilePath = join(tmpDir, cantonFile);
      const cantonBuffer = await readFile(cantonFilePath);
      const media = await updateOrCreateMedia(
        db,
        cantonFile,
        cantonBuffer,
        'application/geo+json',
        folderPath,
        storageProvider,
      );
      await rm(cantonFilePath, { force: true });

      await upsertMapLayer(db, {
        label: `Hausnummern / Addressuche (${canton})`,
        type: 'geojson',
        mediaSourceId: media.documentId,
        options: entranceOptions,
      });
    }

    const cantonFeature = getCantonFeature(cantonGeoJSON, canton);
    const districtsForCanton = getDistrictFeatures(cantonFeature, districtGeoJSON);
    const sourceFile = result.status === 304 ? existingMedia?.url : join(tmpDir, cantonFile);
    const fileSize = result.fileSize ?? (existingMedia?.size ? existingMedia.size * 1000 : 0);
    const shouldSplit = config.allwaysCreateDistrict || fileSize > 25_000_000;

    if (sourceFile && shouldSplit && districtsForCanton.length >= 2) {
      for (const district of districtsForCanton) {
        const districtName = district.properties?.NAME ?? district.properties?.BEZIRKSNA;
        if (!districtName) continue;

        const districtFile = `entrances_${canton}_${districtName.replace(/[^a-zA-Z]/g, '_')}.geojson`;
        const districtExtract = await workerClient.call<{
          districtSuccess: boolean;
          featureCount: number;
        }>('extractEntranceDistrict', {
          district,
          cantonFile: sourceFile,
          tmpDir,
          districtFile,
        });

        if (districtExtract.districtSuccess) {
          const districtPath = join(tmpDir, districtFile);
          const districtBuffer = await readFile(districtPath);
          const media = await updateOrCreateMedia(
            db,
            districtFile,
            districtBuffer,
            'application/geo+json',
            folderPath,
            storageProvider,
          );
          await rm(districtPath, { force: true });

          await upsertMapLayer(db, {
            label: `Hausnummern / Addressuche (${canton}: ${districtName})`,
            type: 'geojson',
            mediaSourceId: media.documentId,
            options: entranceOptions,
          });
        }
      }

      await workerClient.call('extractEntranceDistrictEnd', {
        cantonFile: sourceFile,
      });
    }
  }
}

export async function updateSwissNames3DMedia(
  db: Database,
  workerClient: WorkerClient,
  config: MapLayerGenerationConfigRow,
  styleMedia: FileRow | null,
  cantons: string[],
  cantonGeoJSON: any,
  storageProvider?: StorageProvider,
  logger?: LoggerLike,
  tmpDir: string = os.tmpdir(),
  now: Date = new Date(),
): Promise<void> {
  const filePrefix = config.fileSwissNames3d || 'swissNAMES3D_PLY';
  const folderPath = '/MapLayer/swissNAMES3D';

  const namesOptions = {
    fieldX: 'E',
    fieldY: 'N',
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
  };

  let nationalMedia: FileRow | null = null;
  let year: string | null = null;
  for (const candidateYear of getSwissNamesArchiveYears(now)) {
    const namesFileName = `${filePrefix}_${candidateYear}`;
    const nationalFileName = `${namesFileName}.csv`;
    const [existingNationalMedia] = await db
      .select()
      .from(files)
      .where(and(eq(files.name, nationalFileName), eq(files.folderPath, folderPath)))
      .limit(1);
    const lastModified =
      existingNationalMedia?.updatedAt ? formatForIfModifiedSince(existingNationalMedia.updatedAt) : null;
    const url = renderUrlTemplate(config.urlSwissNames3d, { year: candidateYear });

    logger?.info(`Downloading SwissNames3D from: ${url}`);
    const result = await workerClient.call<{
      status: number;
      success?: boolean;
    }>('downloadAndExtractSwissNamesNational', {
      url,
      lastModified,
      tmpDir,
      namesFileName: filePrefix,
      nationalFileName,
    });

    if (result.status === 404) {
      logger?.debug(`SwissNames3D ${candidateYear} file not found; trying the previous archive.`);
      continue;
    }
    if (result.status !== 304 && result.status >= 400) {
      throw new Error(`${url}: HTTP ${result.status}`);
    }
    if (result.status === 304) {
      if (!existingNationalMedia) continue;
      logger?.info(`SwissNames3D archive ${candidateYear} not modified (304).`);
      nationalMedia = existingNationalMedia;
    } else if (result.success) {
      const nationalPath = join(tmpDir, nationalFileName);
      nationalMedia = await updateOrCreateMedia(
        db,
        nationalFileName,
        await readFile(nationalPath),
        'text/csv',
        folderPath,
        storageProvider,
      );
      await rm(nationalPath, { force: true });
    }

    if (nationalMedia) {
      year = candidateYear;
      await upsertMapLayer(db, {
        label: `${filePrefix} Siedlungsgebiete (Ganze Schweiz)`,
        type: 'csv',
        mediaSourceId: nationalMedia.documentId,
        options: namesOptions,
      });
      break;
    }
  }

  if (nationalMedia && year && cantonGeoJSON?.features) {
    const fieldsToKeep = (config.fieldsSwissNames3d || 'OBJEKTART,OBJEKTKLASSE_TLM,EINWOHNERKATEGORIE,NAME,E,N')
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    for (const canton of cantons) {
      const cantonFeature = getCantonFeature(cantonGeoJSON, canton);

      if (!cantonFeature) continue;

      const cantonFileName = `${filePrefix}_${canton}_${year}.csv`;
      const cantonExtract = await workerClient.call<{
        success: boolean;
        count: number;
      }>('extractSwissNamesCanton', {
        tmpDir,
        cantonFileName,
        fieldsToKeep,
        namesMediaUrl: nationalMedia.url,
        cantonFeature,
      });

      if (cantonExtract.success) {
        const cantonPath = join(tmpDir, cantonFileName);
        const cantonBuffer = await readFile(cantonPath);
        const media = await updateOrCreateMedia(
          db,
          cantonFileName,
          cantonBuffer,
          'text/csv',
          folderPath,
          storageProvider,
        );
        await rm(cantonPath, { force: true });

        await upsertMapLayer(db, {
          label: `${filePrefix} Siedlungsgebiete (${canton})`,
          type: 'csv',
          mediaSourceId: media.documentId,
          options: namesOptions,
        });
      }
    }
  }
}

export interface UpdateMapLayerMediasOptions {
  storageProvider?: StorageProvider;
  logger?: LoggerLike;
  now?: Date;
  tmpDir?: string;
  force?: boolean;
  cantons?: string[];
}

let isRunning = false;

export const isGenerationRunning = (): boolean => isRunning;

export async function updateMapLayerMedias(
  db: Database,
  options: UpdateMapLayerMediasOptions = {},
): Promise<{ success: boolean; startedAt: Date; endedAt: Date }> {
  if (isRunning) {
    throw new Error('Map layer generation is already running.');
  }

  isRunning = true;
  const startedAt = options.now ?? new Date();
  const logger = options.logger ?? console;
  const storageProvider = options.storageProvider ?? getStorageProvider();
  const tmpDir = options.tmpDir ?? os.tmpdir();

  let workerClient: WorkerClient | null = null;

  try {
    const config = await getConfig(db);
    if (!config) {
      throw new Error('updateMapLayerMedias failed: no map-layer-generation-config defined');
    }
    if (!config.enabled && !options.force) {
      throw new Error('updateMapLayerMedias skipped: update is disabled');
    }
    const rawCantons = options.cantons && options.cantons.length > 0 ? options.cantons.join(',') : config.cantons;

    if (!rawCantons || rawCantons.trim().length === 0) {
      throw new Error('updateMapLayerMedias failed: cantons to update is empty');
    }
    if (rawCantons.includes(' ') && !rawCantons.includes(',')) {
      throw new Error('updateMapLayerMedias failed: cantons need to be splited by ","');
    }

    const cantons = rawCantons
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length > 0);

    await updateConfig(db, config.documentId, {
      lastStartDate: startedAt,
    });

    const styleEntrances = await ensureStyleFile(
      db,
      config,
      'styleEntrancesId',
      'entrances-mapboxstyle.json',
      '/MapLayer',
      storageProvider,
      logger,
    );

    const styleSwissBoundaries3d = await ensureStyleFile(
      db,
      config,
      'styleSwissBoundaries3dId',
      'swissBOUNDARIES3D-mapboxstyle.json',
      '/MapLayer',
      storageProvider,
      logger,
    );

    const styleSwissNames3d = await ensureStyleFile(
      db,
      config,
      'styleSwissNames3dId',
      'swissNAMES3D_PLY-mapboxstyle.json',
      '/MapLayer',
      storageProvider,
      logger,
    );

    workerClient = new WorkerClient(logger);

    // 1. SwissBoundaries3D
    const boundaries = await updateSwissBoundariesMedia(
      db,
      workerClient,
      config,
      styleSwissBoundaries3d,
      storageProvider,
      logger,
      tmpDir,
      options.now,
    );

    // Load GeoJSON polygons for spatial clipping
    let cantonGeoJSON: any = null;
    let districtGeoJSON: any = null;

    if (boundaries.cantonAreasMedia) {
      cantonGeoJSON = await workerClient.call('loadShpFile', boundaries.cantonAreasMedia.url);
    }
    if (boundaries.districtAreasMedia) {
      districtGeoJSON = await workerClient.call('loadShpFile', boundaries.districtAreasMedia.url);
    }

    // 2. Entrances
    await updateEntranceMedia(
      db,
      workerClient,
      config,
      styleEntrances,
      cantons,
      districtGeoJSON,
      storageProvider,
      logger,
      tmpDir,
      cantonGeoJSON,
    );

    // 3. SwissNames3D
    await updateSwissNames3DMedia(
      db,
      workerClient,
      config,
      styleSwissNames3d,
      cantons,
      cantonGeoJSON,
      storageProvider,
      logger,
      tmpDir,
      options.now,
    );

    const endedAt = new Date();
    await updateConfig(db, config.documentId, {
      lastEndDate: endedAt,
    });

    return { success: true, startedAt, endedAt };
  } finally {
    if (workerClient) {
      await workerClient.stop();
    }
    isRunning = false;
  }
}
