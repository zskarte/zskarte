import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import AdmZip from 'adm-zip';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalStorageProvider } from '../src/modules/file/storage.js';
import {
  CANTON_NAMES,
  DEFAULT_STYLE_FILES,
  ENTRANCE_SEARCH_REGEX_PATTERNS,
  WorkerClient,
  ensureStyleFile,
  formatForIfModifiedSince,
  getBoundaryArchivePeriods,
  getCantonFeature,
  getDistrictFeatures,
  getSwissNamesArchiveYears,
  isGenerationRunning,
  renderUrlTemplate,
  seedDefaultStyleAssets,
  updateEntranceMedia,
  updateSwissBoundariesMedia,
  updateMapLayerMedias,
  updateOrCreateMedia,
  upsertMapLayer,
} from '../src/modules/map-layer-generation/service.js';
import {
  getConfig,
  initOrGetConfig,
  insertConfig,
  updateConfig,
  updateExecutionDates,
  updateSingleConfig,
} from '../src/modules/map-layer-generation/repository.js';
import { parseCliArgs } from '../src/modules/map-layer-generation/cli.js';
import { runScheduledMapLayerGeneration } from '../src/jobs/scheduler.js';
import { env } from '../src/env.js';
import {
  downloadIfChanged,
  extractEntranceDistrict,
  extractEntranceDistrictEnd,
  extractFilesToNewZip,
  extractSwissNamesCanton,
  prepareSwissNamesContent,
  resetWorkerCaches,
} from '../src/modules/map-layer-generation/worker.js';
import { createMockDb } from './helpers/index.js';

describe('Map Layer Generation - Helpers', () => {
  it('formatForIfModifiedSince handles Dates, numbers, and strings', () => {
    const date = new Date('2026-05-15T12:00:00Z');
    expect(formatForIfModifiedSince(date)).toBe('Fri, 15 May 2026 12:00:00 GMT');
    expect(formatForIfModifiedSince(Math.floor(date.getTime() / 1000))).toBe('Fri, 15 May 2026 12:00:00 GMT');
    expect(formatForIfModifiedSince('2026-05-15T12:00:00Z')).toBe('Fri, 15 May 2026 12:00:00 GMT');
    expect(formatForIfModifiedSince(null)).toBeNull();
    expect(formatForIfModifiedSince(undefined)).toBeNull();
    expect(formatForIfModifiedSince('invalid-date')).toBeNull();
  });

  it('renderUrlTemplate interpolates variables', () => {
    const tmpl = 'https://geo.admin.ch/${year}/${month}/${canton}.zip';
    const result = renderUrlTemplate(tmpl, { year: '2026', month: '09', canton: 'ZH' });
    expect(result).toBe('https://geo.admin.ch/2026/09/ZH.zip');
  });

  it('CANTON_NAMES contains all 26 Swiss cantons', () => {
    expect(Object.keys(CANTON_NAMES)).toHaveLength(26);
    expect(CANTON_NAMES['ZH']).toBe('Zürich');
    expect(CANTON_NAMES['BE']).toBe('Bern');
  });

  it('builds archive fallback candidates across month and year boundaries', () => {
    expect(getBoundaryArchivePeriods(new Date('2026-01-15T00:00:00Z'), 2025)).toEqual([
      { year: '2026', month: '01' },
      ...Array.from({ length: 12 }, (_, index) => ({ year: '2025', month: String(12 - index).padStart(2, '0') })),
    ]);
    expect(getSwissNamesArchiveYears(new Date('2026-01-15T00:00:00Z'), 2025)).toEqual(['2026', '2025']);
  });

  it('resolves canton names and matches districts by numeric KANTONSNUM', () => {
    const cantonFeature = getCantonFeature(
      { features: [{ properties: { NAME: 'Zürich', KANTONSNUM: ZH_NUMBER } }] },
      'zh',
    );
    const districts = getDistrictFeatures(cantonFeature, {
      features: [
        { properties: { NAME: 'District A', KANTONSNUM: ZH_NUMBER } },
        { properties: { NAME: 'District B', KANTONSNUM: ZH_NUMBER } },
        { properties: { NAME: 'Other canton', KANTONSNUM: 99 } },
      ],
    });

    expect(districts).toHaveLength(2);
    expect(districts.every((district) => district.properties.KANTONSNUM === ZH_NUMBER)).toBe(true);
  });
});

const ZH_NUMBER = 1;

describe('Map Layer Generation - Worker Functions', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `zskarte-worker-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await mkdir(tempDir, { recursive: true });
    resetWorkerCaches();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('extractFilesToNewZip filters entries by basename and saves new archive', async () => {
    const zip = new AdmZip();
    zip.addFile('dir/swissBOUNDARIES3D_1_5_TLM_KANTONSGEBIET.shp', Buffer.from('shp-data'));
    zip.addFile('dir/swissBOUNDARIES3D_1_5_TLM_KANTONSGEBIET.dbf', Buffer.from('dbf-data'));
    zip.addFile('dir/swissBOUNDARIES3D_1_5_TLM_BEZIRKSGEBIET.shp', Buffer.from('bezirk-data'));

    const outPath = join(tempDir, 'cantons.zip');
    const result = extractFilesToNewZip(zip, 'swissBOUNDARIES3D_1_5_TLM_KANTONSGEBIET', outPath);

    expect(result).not.toBeNull();
    const extractedZip = new AdmZip(outPath);
    const entries = extractedZip.getEntries().map((e) => e.entryName);
    expect(entries).toContain('dir/swissBOUNDARIES3D_1_5_TLM_KANTONSGEBIET.shp');
    expect(entries).toContain('dir/swissBOUNDARIES3D_1_5_TLM_KANTONSGEBIET.dbf');
    expect(entries).not.toContain('dir/swissBOUNDARIES3D_1_5_TLM_BEZIRKSGEBIET.shp');
  });

  it('downloadIfChanged returns 304 or buffer based on HTTP status', async () => {
    const mockFetch = vi.fn();
    globalThis.fetch = mockFetch;

    // 304 Not Modified
    mockFetch.mockResolvedValueOnce({
      status: 304,
      ok: false,
      headers: new Headers({ 'last-modified': 'Wed, 01 Sep 2026 12:00:00 GMT' }),
    });

    const res304 = await downloadIfChanged('https://test.com/data.zip', 'Wed, 01 Sep 2026 12:00:00 GMT');
    expect(res304.status).toBe(304);
    expect(res304.lastModified).toBe('Wed, 01 Sep 2026 12:00:00 GMT');

    // 200 OK
    const sampleBuffer = Buffer.from('sample-data');
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      headers: new Headers({ 'last-modified': 'Thu, 02 Sep 2026 10:00:00 GMT' }),
      arrayBuffer: () => Promise.resolve(sampleBuffer),
    });

    const res200 = await downloadIfChanged('https://test.com/data.zip');
    expect(res200.status).toBe(200);
    expect(res200.buffer).toBeDefined();
    expect(res200.buffer?.toString()).toBe('sample-data');
  });

  it('extractEntranceDistrict filters points inside polygon district and writes GeoJSON', async () => {
    // Canton geojson in EPSG:2056 coordinates
    // Point 1: Bern coordinates in EPSG:2056 -> ~ [2600000, 1200000] (lat: 46.95, lon: 7.44)
    // Point 2: Zurich coordinates in EPSG:2056 -> ~ [2683000, 1248000] (lat: 47.37, lon: 8.54)
    const cantonGeojson = {
      type: 'FeatureCollection',
      crs: {
        type: 'name',
        properties: { name: 'urn:ogc:def:crs:EPSG::2056' },
      },
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [2600000, 1200000] },
          properties: { streetName: 'Bundesplatz', entranceNumber: '3', zip: '3003', locality: 'Bern' },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [2683000, 1248000] },
          properties: { streetName: 'Bahnhofstrasse', entranceNumber: '1', zip: '8001', locality: 'Zürich' },
        },
      ],
    };

    const cantonFilePath = join(tempDir, 'canton.geojson');
    await writeFile(cantonFilePath, JSON.stringify(cantonGeojson));

    // District polygon covering Bern region in WGS84 [lon, lat]
    const bernDistrictPolygon = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [7.4, 46.9],
            [7.5, 46.9],
            [7.5, 47.0],
            [7.4, 47.0],
            [7.4, 46.9],
          ],
        ],
      },
      properties: { NAME: 'Bern-Mittelland' },
    };

    const result = await extractEntranceDistrict({
      district: bernDistrictPolygon,
      cantonFile: cantonFilePath,
      tmpDir: tempDir,
      districtFile: 'district-bern.geojson',
    });

    expect(result.districtSuccess).toBe(true);
    expect(result.featureCount).toBe(1);

    const districtContent = JSON.parse(await readFile(join(tempDir, 'district-bern.geojson'), 'utf-8'));
    expect(districtContent.features).toHaveLength(1);
    expect(districtContent.features[0].properties.locality).toBe('Bern');

    const endResult = extractEntranceDistrictEnd({ cantonFile: cantonFilePath });
    expect(endResult.success).toBe(true);
  });

  it('prepareSwissNamesContent and extractSwissNamesCanton parse CSV and filter by canton', async () => {
    // CSV with EPSG:2056 coordinates
    const csvData = [
      'OBJEKTART;OBJEKTKLASSE_TLM;EINWOHNERKATEGORIE;NAME;E;N',
      'Ortschaft;TLM_SIEDLUNGSNAME;500 - 1000;Bern;2600000;1200000',
      'Ortschaft;TLM_SIEDLUNGSNAME;500 - 1000;Zürich;2683000;1248000',
    ].join('\n');

    const csvPath = join(tempDir, 'swissnames.csv');
    await writeFile(csvPath, csvData);

    const fieldsToKeep = ['OBJEKTART', 'OBJEKTKLASSE_TLM', 'EINWOHNERKATEGORIE', 'NAME', 'E', 'N'];
    const rows = await prepareSwissNamesContent({
      namesMediaUrl: csvPath,
      fieldsToKeep,
    });

    expect(rows).toHaveLength(2);
    expect(rows[0].NAME).toBe('Bern');
    expect(rows[0].coord[0]).toBeCloseTo(7.439, 1);
    expect(rows[0].coord[1]).toBeCloseTo(46.952, 1);

    // Filter by Bern polygon
    const bernPolygon = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [7.4, 46.9],
            [7.5, 46.9],
            [7.5, 47.0],
            [7.4, 47.0],
            [7.4, 46.9],
          ],
        ],
      },
      properties: { NAME: 'Bern' },
    };

    const cantonExtract = await extractSwissNamesCanton({
      tmpDir: tempDir,
      cantonFileName: 'swissnames_BE.csv',
      fieldsToKeep,
      namesMediaUrl: csvPath,
      cantonFeature: bernPolygon,
    });

    expect(cantonExtract.success).toBe(true);
    expect(cantonExtract.count).toBe(1);

    const extractedCsv = await readFile(join(tempDir, 'swissnames_BE.csv'), 'utf-8');
    expect(extractedCsv).toContain('Bern');
    expect(extractedCsv).not.toContain('Zürich');
  });

  it('WorkerClient executes functions inside a Node worker thread', async () => {
    const client = new WorkerClient();
    try {
      const resetRes = await client.call('resetCaches');
      expect(resetRes).toEqual({ success: true });
    } finally {
      await client.stop();
    }
  });
});

describe('Map Layer Generation - Service & Database Integration', () => {
  let tempDir: string;
  let storageProvider: LocalStorageProvider;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `zskarte-srv-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await mkdir(tempDir, { recursive: true });
    storageProvider = new LocalStorageProvider(tempDir, '/uploads/');
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('falls back to the previous published boundaries archive after a 404', async () => {
    const downloadCalls: Record<string, unknown>[] = [];
    let downloadCount = 0;
    const workerClient = {
      call: async (type: string, params: Record<string, any>) => {
        if (type !== 'downloadAndExtractSwissBoundaries') throw new Error(`Unexpected worker call: ${type}`);
        downloadCalls.push(params);
        downloadCount += 1;
        if (downloadCount === 1) return { status: 404 };
        await writeFile(join(params.tmpDir, params.cantonFile), Buffer.from('canton archive'));
        await writeFile(join(params.tmpDir, params.districtFile), Buffer.from('district archive'));
        return { status: 200, cantonSuccess: true, districtSuccess: true };
      },
    } as unknown as WorkerClient;
    const cantonFile = {
      documentId: 'canton-file',
      name: 'swissBOUNDARIES3D_KANTONSGEBIET_2026_01.zip',
      url: '/uploads/canton.zip',
    };
    const districtFile = {
      documentId: 'district-file',
      name: 'swissBOUNDARIES3D_BEZIRKSGEBIET_2026_01.zip',
      url: '/uploads/district.zip',
    };
    const { db } = createMockDb({
      selects: [[], [], [], [], [], [], [], []],
      returning: [[cantonFile], [districtFile], [{ documentId: 'canton-layer' }], [{ documentId: 'district-layer' }]],
    });

    const result = await updateSwissBoundariesMedia(
      db,
      workerClient,
      {
        urlSwissBoundaries3d: 'https://geo.example/${year}/${month}.zip',
      } as any,
      null,
      storageProvider,
      undefined,
      tempDir,
      new Date('2026-02-15T00:00:00Z'),
    );

    expect(downloadCalls.map((call) => call.url)).toEqual([
      'https://geo.example/2026/02.zip',
      'https://geo.example/2026/01.zip',
    ]);
    expect(result.cantonAreasMedia?.documentId).toBe('canton-file');
    expect(result.districtAreasMedia?.documentId).toBe('district-file');
  });

  it('uses lowercase MADD URLs and creates district layers from numeric canton boundaries', async () => {
    const calls: { type: string; params: Record<string, any> }[] = [];
    const workerClient = {
      call: async (type: string, params: Record<string, any>) => {
        calls.push({ type, params });
        if (type === 'downloadAndExtractEntrance') {
          await writeFile(join(params.tmpDir, params.cantonFile), Buffer.from('{"type":"FeatureCollection"}'));
          return { status: 200, cantonSuccess: true, fileSize: 30_000_000 };
        }
        if (type === 'extractEntranceDistrict') {
          await writeFile(join(params.tmpDir, params.districtFile), Buffer.from('{"type":"FeatureCollection"}'));
          return { districtSuccess: true, featureCount: 1 };
        }
        return { success: true };
      },
    } as unknown as WorkerClient;
    const { db, captured } = createMockDb({
      selects: [[], [], [], [], [], [], []],
      returning: [
        [{ documentId: 'canton-entrances' }],
        [{ documentId: 'canton-layer' }],
        [{ documentId: 'district-a-entrances' }],
        [{ documentId: 'district-a-layer' }],
        [{ documentId: 'district-b-entrances' }],
        [{ documentId: 'district-b-layer' }],
      ],
    });

    await updateEntranceMedia(
      db,
      workerClient,
      {
        urlMadd: 'https://madd.example/${canton}.zip',
        allwaysCreateDistrict: true,
      } as any,
      null,
      ['ZH'],
      {
        features: [
          { properties: { NAME: 'District A', KANTONSNUM: ZH_NUMBER } },
          { properties: { NAME: 'District B', KANTONSNUM: ZH_NUMBER } },
          { properties: { NAME: 'Other', KANTONSNUM: 99 } },
        ],
      },
      storageProvider,
      undefined,
      tempDir,
      { features: [{ properties: { NAME: 'Zürich', KANTONSNUM: ZH_NUMBER } }] },
    );

    expect(calls[0].params.url).toBe('https://madd.example/zh.zip');
    const districtCalls = calls.filter((call) => call.type === 'extractEntranceDistrict');
    expect(districtCalls).toHaveLength(2);
    expect(districtCalls.map((call) => call.params.district.properties.NAME)).toEqual(['District A', 'District B']);

    const entranceLayerInserts = captured.inserted.filter((row) => String(row.label).startsWith('Hausnummern'));
    expect(entranceLayerInserts).toHaveLength(3);
    expect(
      entranceLayerInserts.every((row) => row.options?.searchRegExPatterns === ENTRANCE_SEARCH_REGEX_PATTERNS),
    ).toBe(true);
  });

  it('updateOrCreateMedia uploads new file when not present', async () => {
    const fakeRow = {
      documentId: 'file-123',
      name: 'test.geojson',
      mime: 'application/geo+json',
      size: 1.5,
      url: '/uploads/file-123.json',
      folderPath: '/MapLayer/entrances',
      provider: 'local',
    };

    const { db, captured } = createMockDb({
      selects: [[]],
      returning: [[fakeRow]],
    });

    const file = await updateOrCreateMedia(
      db,
      'test.geojson',
      Buffer.from('{"type":"FeatureCollection"}'),
      'application/geo+json',
      '/MapLayer/entrances',
      storageProvider,
    );

    expect(file.documentId).toBe('file-123');
    expect(captured.inserted).toHaveLength(1);
    expect(captured.inserted[0].name).toBe('test.geojson');
    expect(captured.inserted[0].folderPath).toBe('/MapLayer/entrances');
  });

  it('updateOrCreateMedia replaces existing file when present', async () => {
    const existingRow = {
      documentId: 'file-123',
      name: 'test.geojson',
      mime: 'application/geo+json',
      size: 1.5,
      url: '/uploads/old-hash.json',
      folderPath: '/MapLayer/entrances',
      provider: 'local',
    };

    const updatedRow = {
      ...existingRow,
      url: '/uploads/new-hash.json',
    };

    const { db, captured } = createMockDb({
      selects: [[existingRow], [existingRow]],
      returning: [[updatedRow]],
    });

    const file = await updateOrCreateMedia(
      db,
      'test.geojson',
      Buffer.from('{"type":"FeatureCollection","updated":true}'),
      'application/geo+json',
      '/MapLayer/entrances',
      storageProvider,
    );

    expect(file.documentId).toBe('file-123');
    expect(captured.updated).toHaveLength(1);
    expect(captured.updated[0].name).toBe('test.geojson');
  });

  it('upsertMapLayer inserts layer when missing with null organizationId and public: true', async () => {
    const createdRow = {
      documentId: 'layer-123',
      label: 'Kantonsgrenzen',
      type: 'shape',
      mediaSourceId: 'file-123',
      public: true,
      organizationId: null,
      options: { hidden: false },
    };

    const { db, captured } = createMockDb({
      selects: [[]],
      returning: [[createdRow]],
    });

    const layer = await upsertMapLayer(db, {
      label: 'Kantonsgrenzen',
      type: 'shape',
      mediaSourceId: 'file-123',
      options: { hidden: false },
    });

    expect(layer.documentId).toBe('layer-123');
    expect(captured.inserted).toHaveLength(1);
    expect(captured.inserted[0].label).toBe('Kantonsgrenzen');
    expect(captured.inserted[0].public).toBe(true);
    expect(captured.inserted[0].organizationId).toBeNull();
  });

  it('upsertMapLayer updates existing layer without creating duplicate', async () => {
    const existingRow = {
      documentId: 'layer-123',
      label: 'Kantonsgrenzen',
      type: 'shape',
      mediaSourceId: 'file-old',
      public: true,
      organizationId: null,
      options: { hidden: false },
    };

    const updatedRow = {
      ...existingRow,
      mediaSourceId: 'file-new',
    };

    const { db, captured } = createMockDb({
      selects: [[existingRow]],
      returning: [[updatedRow]],
    });

    const layer = await upsertMapLayer(db, {
      label: 'Kantonsgrenzen',
      type: 'shape',
      mediaSourceId: 'file-new',
      options: { hidden: false },
    });

    expect(layer.documentId).toBe('layer-123');
    expect(captured.updated).toHaveLength(1);
    expect(captured.updated[0].mediaSourceId).toBe('file-new');
    expect(captured.inserted).toHaveLength(0);
  });

  it('ensureStyleFile returns existing file when style ID is configured', async () => {
    const configRow = {
      documentId: 'cfg-1',
      styleEntrancesId: 'style-file-123',
    };
    const styleFileRow = {
      documentId: 'style-file-123',
      name: 'entrances-mapboxstyle.json',
      url: '/uploads/style.json',
    };

    const { db } = createMockDb({
      selects: [[styleFileRow]],
    });

    const result = await ensureStyleFile(
      db,
      configRow as any,
      'styleEntrancesId',
      'entrances-mapboxstyle.json',
      '/MapLayer',
      storageProvider,
    );

    expect(result?.documentId).toBe('style-file-123');
  });

  it('updateMapLayerMedias skips execution when disabled in config', async () => {
    const configRow = {
      documentId: 'cfg-1',
      enabled: false,
      cantons: 'ZH,BE',
    };

    const { db } = createMockDb({
      selects: [[configRow]],
    });

    await expect(updateMapLayerMedias(db, { storageProvider })).rejects.toThrow(
      'updateMapLayerMedias skipped: update is disabled',
    );
    expect(isGenerationRunning()).toBe(false);
  });

  it('updateMapLayerMedias validates cantons formatting', async () => {
    const configRow = {
      documentId: 'cfg-1',
      enabled: true,
      cantons: 'ZH BE AG',
    };

    const { db } = createMockDb({
      selects: [[configRow]],
    });

    await expect(updateMapLayerMedias(db, { storageProvider })).rejects.toThrow('cantons need to be splited by ","');
    expect(isGenerationRunning()).toBe(false);
  });
});

describe('Map Layer Generation - Repository', () => {
  it('getConfig returns null when table is empty', async () => {
    const { db } = createMockDb({ selects: [[]] });
    const result = await getConfig(db);
    expect(result).toBeNull();
  });

  it('getConfig returns first row when present', async () => {
    const row = { documentId: 'cfg-123', enabled: true, cantons: 'BE,ZH' };
    const { db } = createMockDb({ selects: [[row]] });
    const result = await getConfig(db);
    expect(result?.documentId).toBe('cfg-123');
    expect(result?.enabled).toBe(true);
  });

  it('insertConfig inserts new config row', async () => {
    const createdRow = { documentId: 'cfg-new', enabled: true, cantons: 'AG,BE' };
    const { db, captured } = createMockDb({ returning: [[createdRow]] });
    const result = await insertConfig(db, { enabled: true, cantons: 'AG,BE' });
    expect(result.documentId).toBe('cfg-new');
    expect(captured.inserted).toHaveLength(1);
    expect(captured.inserted[0]).toMatchObject({ enabled: true });
  });

  it('updateConfig updates row with timestamp', async () => {
    const updatedRow = { documentId: 'cfg-123', enabled: true, cantons: 'ZH' };
    const { db, captured } = createMockDb({ returning: [[updatedRow]] });
    const result = await updateConfig(db, 'cfg-123', { cantons: 'ZH' });
    expect(result?.cantons).toBe('ZH');
    expect(captured.updated).toHaveLength(1);
    expect(captured.updated[0]).toMatchObject({ cantons: 'ZH' });
    expect(captured.updated[0]).toHaveProperty('updatedAt');
  });

  it('initOrGetConfig returns existing config if present', async () => {
    const existingRow = { documentId: 'cfg-existing', enabled: false };
    const { db, captured } = createMockDb({ selects: [[existingRow]] });
    const result = await initOrGetConfig(db);
    expect(result.documentId).toBe('cfg-existing');
    expect(captured.inserted).toHaveLength(0);
  });

  it('initOrGetConfig inserts new config if missing', async () => {
    const createdRow = { documentId: 'cfg-created', enabled: false };
    const { db, captured } = createMockDb({ selects: [[]], returning: [[createdRow]] });
    const result = await initOrGetConfig(db);
    expect(result.documentId).toBe('cfg-created');
    expect(captured.inserted).toHaveLength(1);
  });

  it('updateSingleConfig updates the single config row', async () => {
    const existingRow = { documentId: 'cfg-1', enabled: false };
    const updatedRow = { documentId: 'cfg-1', enabled: true };
    const { db, captured } = createMockDb({
      selects: [[existingRow]],
      returning: [[updatedRow]],
    });
    const result = await updateSingleConfig(db, { enabled: true });
    expect(result.enabled).toBe(true);
    expect(captured.updated).toHaveLength(1);
  });

  it('updateExecutionDates updates lastStartDate and lastEndDate', async () => {
    const now = new Date();
    const updatedRow = { documentId: 'cfg-1', lastStartDate: now, lastEndDate: now };
    const { db, captured } = createMockDb({ returning: [[updatedRow]] });
    const result = await updateExecutionDates(db, 'cfg-1', { lastStartDate: now, lastEndDate: now });
    expect(result?.lastStartDate).toBe(now);
    expect(captured.updated).toHaveLength(1);
  });
});

describe('Map Layer Generation - CLI', () => {
  it('parseCliArgs parses all flag types correctly', () => {
    const parsed = parseCliArgs(['--force', '--cantons=BE,ZH,AG', '--date=2026-05-15T00:00:00Z', '--seed-styles-only']);
    expect(parsed.force).toBe(true);
    expect(parsed.cantons).toEqual(['BE', 'ZH', 'AG']);
    expect(parsed.date).toEqual(new Date('2026-05-15T00:00:00Z'));
    expect(parsed.seedStylesOnly).toBe(true);
  });

  it('parseCliArgs parses short flags and help', () => {
    const parsed = parseCliArgs(['-f', '-h']);
    expect(parsed.force).toBe(true);
    expect(parsed.help).toBe(true);
  });

  it('parseCliArgs throws error on invalid date string', () => {
    expect(() => parseCliArgs(['--date=invalid-date-str'])).toThrow('Invalid date format');
  });
});

describe('Map Layer Generation - Scheduler Trigger', () => {
  const fakeLogger = {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips scheduled generation when MAPLAYER_GENERATION_ENABLED is false without force', async () => {
    const { db } = createMockDb();
    await runScheduledMapLayerGeneration({ db, logger: fakeLogger });
    expect(fakeLogger.debug).toHaveBeenCalledWith(expect.stringContaining('MAPLAYER_GENERATION_ENABLED is false'));
  });

  it('skips scheduled generation when config is disabled', async () => {
    const configRow = { documentId: 'cfg-1', enabled: false };
    const { db } = createMockDb({ selects: [[configRow]] });

    await runScheduledMapLayerGeneration({ db, logger: fakeLogger }, { force: true });
    expect(fakeLogger.info).toHaveBeenCalledWith(expect.stringContaining('config.enabled is false'));
  });

  it('skips scheduled generation when no config row is found', async () => {
    const { db } = createMockDb({ selects: [[]] });

    await runScheduledMapLayerGeneration({ db, logger: fakeLogger }, { force: true });
    expect(fakeLogger.warn).toHaveBeenCalledWith(expect.stringContaining('no config row found'));
  });
});

describe('Map Layer Generation - Style Asset Seeding', () => {
  let tempDir: string;
  let storageProvider: LocalStorageProvider;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `zskarte-style-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await mkdir(tempDir, { recursive: true });
    storageProvider = new LocalStorageProvider(tempDir, '/uploads/');
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('DEFAULT_STYLE_FILES includes all four bundled style files', () => {
    expect(DEFAULT_STYLE_FILES).toHaveLength(4);
    const names = DEFAULT_STYLE_FILES.map((s) => s.fileName);
    expect(names).toContain('entrances-mapboxstyle.json');
    expect(names).toContain('swissBOUNDARIES3D-mapboxstyle.json');
    expect(names).toContain('swissNAMES3D_PLY-mapboxstyle.json');
    expect(names).toContain('entrances-olstyle.json');
  });

  it('seedDefaultStyleAssets seeds and updates config style references', async () => {
    const configRow = {
      documentId: 'cfg-1',
      styleEntrancesId: null,
      styleSwissBoundaries3dId: null,
      styleSwissNames3dId: null,
    };
    const styleEntranceFile = {
      documentId: 'file-style-1',
      name: 'entrances-mapboxstyle.json',
      url: '/uploads/entrances-style.json',
      folderPath: '/MapLayer',
    };
    const styleBoundariesFile = {
      documentId: 'file-style-2',
      name: 'swissBOUNDARIES3D-mapboxstyle.json',
      url: '/uploads/boundaries-style.json',
      folderPath: '/MapLayer',
    };
    const styleNamesFile = {
      documentId: 'file-style-3',
      name: 'swissNAMES3D_PLY-mapboxstyle.json',
      url: '/uploads/names-style.json',
      folderPath: '/MapLayer',
    };
    const styleOlFile = {
      documentId: 'file-style-4',
      name: 'entrances-olstyle.json',
      url: '/uploads/ol-style.json',
      folderPath: '/MapLayer',
    };

    const { db } = createMockDb({
      selects: [
        [configRow], // initOrGetConfig
        [styleEntranceFile], // ensureStyleFile (entrances)
        [styleBoundariesFile], // ensureStyleFile (boundaries)
        [styleNamesFile], // ensureStyleFile (names)
        [styleOlFile], // existing ol file select
        [configRow], // final getConfig
      ],
      returning: [
        [{ ...configRow, styleEntrancesId: 'file-style-1' }],
        [{ ...configRow, styleSwissBoundaries3dId: 'file-style-2' }],
        [{ ...configRow, styleSwissNames3dId: 'file-style-3' }],
      ],
    });

    const result = await seedDefaultStyleAssets(db, { storageProvider });
    expect(result.seeded).toHaveLength(4);
    expect(result.seeded.map((f) => f.documentId)).toEqual([
      'file-style-1',
      'file-style-2',
      'file-style-3',
      'file-style-4',
    ]);
  });
});

describe('Map Layer Generation - End-to-End Orchestration & Idempotency', () => {
  let tempDir: string;
  let storageProvider: LocalStorageProvider;
  const fakeLogger = {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as any;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `zskarte-e2e-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await mkdir(tempDir, { recursive: true });
    storageProvider = new LocalStorageProvider(tempDir, '/uploads/');
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('runs complete generation pipeline and updates execution dates', async () => {
    const configRow = {
      documentId: 'cfg-e2e',
      enabled: true,
      cantons: 'ZH',
      urlSwissBoundaries3d: 'https://geo.admin.ch/boundaries/${year}/${month}.zip',
      urlMadd: 'https://housing-stat.ch/madd/${canton}.zip',
      urlSwissNames3d: 'https://geo.admin.ch/names/${year}.zip',
      styleEntrancesId: 'style-ent',
      styleSwissBoundaries3dId: 'style-bound',
      styleSwissNames3dId: 'style-names',
      allwaysCreateDistrict: false,
    };

    const styleFile = {
      documentId: 'style-ent',
      name: 'entrances-mapboxstyle.json',
      url: '/uploads/style-ent.json',
    };

    const cantonGeoJson = {
      type: 'FeatureCollection',
      features: [{ properties: { NAME: 'Zürich', KANTONSNUM: 1 } }],
    };

    const districtGeoJson = {
      type: 'FeatureCollection',
      features: [{ properties: { NAME: 'Bezirk Zürich', KANTONSNUM: 1 } }],
    };

    const callSpy = vi.spyOn(WorkerClient.prototype, 'call').mockImplementation(async (type, params: any) => {
      if (type === 'resetCaches') return { success: true };
      if (type === 'loadShpFile') return cantonGeoJson;
      if (type === 'downloadAndExtractSwissBoundaries') {
        await writeFile(join(params.tmpDir, params.cantonFile), JSON.stringify(cantonGeoJson));
        await writeFile(join(params.tmpDir, params.districtFile), JSON.stringify(districtGeoJson));
        return { status: 200, cantonSuccess: true, districtSuccess: true };
      }
      if (type === 'downloadAndExtractEntrance') {
        await writeFile(
          join(params.tmpDir, params.cantonFile),
          JSON.stringify({ type: 'FeatureCollection', features: [] }),
        );
        return { status: 200, cantonSuccess: true, fileSize: 5000 };
      }
      if (type === 'downloadAndExtractSwissNamesNational') {
        await writeFile(join(params.tmpDir, params.nationalFileName), 'OBJEKTART;NAME\nOrtschaft;Zürich');
        return { status: 200, success: true };
      }
      if (type === 'extractSwissNamesCanton') {
        await writeFile(join(params.tmpDir, params.cantonFileName), 'OBJEKTART;NAME\nOrtschaft;Zürich');
        return { success: true, count: 1 };
      }
      return { success: true };
    });

    vi.spyOn(WorkerClient.prototype, 'stop').mockResolvedValue(0);

    const createdFile = (name: string, url: string) => ({
      documentId: `file-${name}`,
      name,
      url,
      size: 1.0,
      mime: 'application/json',
      provider: 'local',
    });

    const { db, captured } = createMockDb({
      selects: [
        [configRow], // getConfig
        [styleFile], // styleEntrances
        [styleFile], // styleBoundaries
        [styleFile], // styleNames
        [styleFile], // styleOl
        [], // boundaries canton media lookup
        [], // boundaries district media lookup
        [], // entrance media lookup
        [], // swissnames national media lookup
        [], // swissnames canton media lookup
      ],
      returning: [
        [{ ...configRow, lastStartDate: new Date() }], // updateExecutionDates (start)
        [createdFile('boundaries_canton.geojson', '/uploads/bc.geojson')], // canton media insert
        [{ documentId: 'layer-bc' }], // canton layer upsert
        [createdFile('boundaries_district.geojson', '/uploads/bd.geojson')], // district media insert
        [{ documentId: 'layer-bd' }], // district layer upsert
        [createdFile('entrances_ZH.geojson', '/uploads/ent_zh.geojson')], // entrance media insert
        [{ documentId: 'layer-ent-zh' }], // entrance layer upsert
        [createdFile('swissnames_national.csv', '/uploads/sn.csv')], // swissnames national media insert
        [{ documentId: 'layer-sn' }], // swissnames national layer upsert
        [createdFile('swissnames_ZH.csv', '/uploads/sn_zh.csv')], // swissnames ZH media insert
        [{ documentId: 'layer-sn-zh' }], // swissnames ZH layer upsert
        [{ ...configRow, lastEndDate: new Date() }], // updateExecutionDates (end)
      ],
    });

    const result = await updateMapLayerMedias(db, {
      storageProvider,
      tmpDir: tempDir,
      logger: fakeLogger,
      cantons: ['ZH'],
      force: true,
      now: new Date('2026-09-02T10:00:00Z'),
    });

    expect(result.success).toBe(true);
    expect(callSpy).toHaveBeenCalledWith('downloadAndExtractSwissBoundaries', expect.anything());
    expect(callSpy).toHaveBeenCalledWith('downloadAndExtractEntrance', expect.anything());
    expect(callSpy).toHaveBeenCalledWith('downloadAndExtractSwissNamesNational', expect.anything());
    expect(callSpy).toHaveBeenCalledWith('extractSwissNamesCanton', expect.anything());

    const dateUpdates = captured.updated.filter((u) => 'lastStartDate' in u || 'lastEndDate' in u);
    expect(dateUpdates.length).toBeGreaterThanOrEqual(2);
  });

  it('handles 304 Not Modified idempotently without recreating files', async () => {
    const configRow = {
      documentId: 'cfg-304',
      enabled: true,
      cantons: 'ZH',
      urlSwissBoundaries3d: 'https://geo.admin.ch/boundaries/${year}/${month}.zip',
      urlMadd: 'https://housing-stat.ch/madd/${canton}.zip',
      urlSwissNames3d: 'https://geo.admin.ch/names/${year}.zip',
      styleEntrancesId: 'style-ent',
      styleSwissBoundaries3dId: 'style-bound',
      styleSwissNames3dId: 'style-names',
      allwaysCreateDistrict: false,
    };

    const styleFile = {
      documentId: 'style-ent',
      name: 'entrances-mapboxstyle.json',
      url: '/uploads/style-ent.json',
    };

    const existingBoundaries = {
      documentId: 'file-bound-existing',
      name: 'swissBOUNDARIES3D_1_5_TLM_KANTONSGEBIET_2026_09.geojson',
      url: '/uploads/existing-boundaries.geojson',
      updatedAt: new Date(),
    };

    const existingEntrance = {
      documentId: 'file-ent-existing',
      name: 'entrances_ZH.geojson',
      url: '/uploads/existing-ent.geojson',
      updatedAt: new Date(),
    };

    const existingNames = {
      documentId: 'file-names-existing',
      name: 'swissNAMES3D_PLY_2026.csv',
      url: '/uploads/existing-names.csv',
      updatedAt: new Date(),
    };

    vi.spyOn(WorkerClient.prototype, 'call').mockImplementation(async (type) => {
      if (type === 'resetCaches') return { success: true };
      if (type === 'downloadAndExtractSwissBoundaries') return { status: 304 };
      if (type === 'downloadAndExtractEntrance') return { status: 304 };
      if (type === 'downloadAndExtractSwissNamesNational') return { status: 304 };
      return { success: true };
    });

    vi.spyOn(WorkerClient.prototype, 'stop').mockResolvedValue(0);

    const { db, captured } = createMockDb({
      selects: [
        [configRow], // getConfig
        [styleFile], // styleEntrances
        [styleFile], // styleBoundaries
        [styleFile], // styleNames
        [styleFile], // styleOl
        [existingBoundaries], // boundaries canton media lookup
        [], // boundaries district media lookup
        [existingEntrance], // entrance media lookup
        [existingNames], // swissnames national media lookup
      ],
      returning: [[{ ...configRow, lastStartDate: new Date() }], [{ ...configRow, lastEndDate: new Date() }]],
    });

    const result = await updateMapLayerMedias(db, {
      storageProvider,
      tmpDir: tempDir,
      logger: fakeLogger,
      cantons: ['ZH'],
      force: true,
      now: new Date('2026-09-02T10:00:00Z'),
    });

    expect(result.success).toBe(true);
    const mediaInserts = captured.inserted.filter((i) => 'folderPath' in i);
    expect(mediaInserts).toHaveLength(0);
  });

  it('rejects concurrent generation requests when already running', async () => {
    const configRow = {
      documentId: 'cfg-conc',
      enabled: true,
      cantons: 'ZH',
    };

    vi.spyOn(WorkerClient.prototype, 'call').mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { success: true };
    });

    const { db } = createMockDb({
      selects: [[configRow], [configRow]],
      returning: [[configRow]],
    });

    const firstPromise = updateMapLayerMedias(db, {
      storageProvider,
      tmpDir: tempDir,
      cantons: ['ZH'],
      force: true,
    });

    await expect(
      updateMapLayerMedias(db, {
        storageProvider,
        tmpDir: tempDir,
        cantons: ['ZH'],
        force: true,
      }),
    ).rejects.toThrow('Map layer generation is already running.');

    try {
      await firstPromise;
    } catch {
      // ignore
    }
  });
});
