/**
 * the map renderer utils read `window` on import, so this spec needs a dom
 * @vitest-environment jsdom
 */
//the angular packages are partially compiled, without a test setup the jit compiler has to be loaded explicitly
import '@angular/compiler';
//no fakeAsync is used here, so describe/it/expect can be imported directly instead of relying on globals
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Need to be befor other imports, hoisted so the mock factories can use them
const { trpcMock, dbMock } = vi.hoisted(() => ({
  trpcMock: {
    mapLayer: {
      list: { query: vi.fn() },
      create: { mutate: vi.fn() },
      update: { mutate: vi.fn() },
    },
    wmsSource: {
      list: { query: vi.fn() },
      create: { mutate: vi.fn() },
      update: { mutate: vi.fn() },
    },
  },
  dbMock: {
    localMapLayer: { put: vi.fn(), toArray: vi.fn() },
    localWmsSource: { put: vi.fn(), toArray: vi.fn() },
    localMapLayerSettings: { put: vi.fn(), get: vi.fn() },
  },
}));
vi.mock('../api/trpc.client', () => ({ trpc: trpcMock }));
vi.mock('../db/db', () => ({ db: dbMock }));

import { Injector } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MapLayer, WmsSource } from '@zskarte/types';
import { environment } from '../../environments/environment';
import { BlobService } from '../db/blob.service';
import { MapLayerService } from './map-layer.service';
import { WmsService } from './wms/wms.service';

const ORGANIZATION_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_ORGANIZATION_ID = '22222222-2222-2222-2222-222222222222';
const WMS_SOURCE_ID = '33333333-3333-3333-3333-333333333333';
const MEDIA_SOURCE_ID = '44444444-4444-4444-4444-444444444444';
const MAP_LAYER_ID = '55555555-5555-5555-5555-555555555555';

const sanitizerMock = { sanitize: (_context: number, value: string) => value };
const blobServiceMock = { downloadBlob: vi.fn() };

function wmsSourceResponse(overrides = {}) {
  return {
    documentId: WMS_SOURCE_ID,
    label: 'Source',
    type: 'wms' as const,
    url: 'https://wms.example.org/',
    attribution: null,
    public: true,
    organization: { documentId: ORGANIZATION_ID },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    ...overrides,
  };
}

function mapLayerResponse(overrides = {}) {
  return {
    documentId: MAP_LAYER_ID,
    label: 'Layer',
    serverLayerName: 'layer-name',
    type: 'wms' as const,
    public: true,
    options: { MinScaleDenominator: 5000 },
    wms_source: { documentId: WMS_SOURCE_ID },
    media_source: null,
    custom_source: null,
    organization: { documentId: ORGANIZATION_ID },
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    ...overrides,
  };
}

function localWmsSource(): WmsSource {
  return {
    documentId: WMS_SOURCE_ID,
    url: 'https://wms.example.org/',
    label: 'Source',
    type: 'wms',
    owner: true,
    public: true,
  };
}

function createInjector() {
  return Injector.create({
    providers: [
      { provide: DomSanitizer, useValue: sanitizerMock },
      { provide: BlobService, useValue: blobServiceMock },
      { provide: MapLayerService, useClass: MapLayerService, deps: [] },
      { provide: WmsService, useClass: WmsService, deps: [] },
    ],
  });
}

describe('MapLayerService', () => {
  let service: MapLayerService;

  beforeEach(() => {
    vi.clearAllMocks();
    dbMock.localMapLayer.toArray.mockResolvedValue([]);
    dbMock.localWmsSource.toArray.mockResolvedValue([]);
    service = createInjector().get(MapLayerService);
  });

  describe('readGlobalMapLayers', () => {
    it('reads the flat list of the mapLayer.list query and identifies the layers by documentId', async () => {
      trpcMock.mapLayer.list.query.mockResolvedValue([mapLayerResponse()]);

      const layers = await service.readGlobalMapLayers([localWmsSource()], ORGANIZATION_ID);

      expect(trpcMock.mapLayer.list.query).toHaveBeenCalledTimes(1);
      expect(layers.length).toBe(1);
      expect(layers[0].documentId).toBe(MAP_LAYER_ID);
      expect(layers[0].id).toBe(undefined);
      expect(layers[0].fullId).toBe(`https://wms.example.org/|layer-name|${MAP_LAYER_ID}`);
      expect(layers[0].source?.documentId).toBe(WMS_SOURCE_ID);
      expect(layers[0].opacity).toBe(0.75);
      expect(layers[0].owner).toBe(true);
      expect(layers[0].managed).toBe(false);
      expect((layers[0] as MapLayer & { MinScaleDenominator: number }).MinScaleDenominator).toBe(5000);
    });

    it('flags layers of another organization as not owned and layers without organization as managed', async () => {
      trpcMock.mapLayer.list.query.mockResolvedValue([
        mapLayerResponse({ organization: { documentId: OTHER_ORGANIZATION_ID } }),
        mapLayerResponse({ organization: null }),
      ]);

      const layers = await service.readGlobalMapLayers([localWmsSource()], ORGANIZATION_ID);

      expect(layers[0].owner).toBe(false);
      expect(layers[0].managed).toBe(false);
      expect(layers[1].owner).toBe(false);
      expect(layers[1].managed).toBe(true);
    });

    it('resolves a relative media url and a relative styleUrl against the new backend', async () => {
      trpcMock.mapLayer.list.query.mockResolvedValue([
        mapLayerResponse({
          type: 'geojson' as const,
          wms_source: null,
          media_source: { documentId: MEDIA_SOURCE_ID, url: '/uploads/layer.geojson', name: 'layer.geojson' },
          options: { styleSourceType: 'url', styleUrl: '/uploads/style.json' },
        }),
      ]);

      const layers = await service.readGlobalMapLayers([], ORGANIZATION_ID);

      expect(layers[0].source?.url).toBe(`${environment.apiUrlNext}/uploads/layer.geojson`);
      expect(layers[0].source?.documentId).toBe(MEDIA_SOURCE_ID);
      expect(layers[0].fullId).toBe(`${environment.apiUrlNext}/uploads/layer.geojson|layer-name|${MAP_LAYER_ID}`);
      expect((layers[0] as MapLayer & { styleUrl: string }).styleUrl).toBe(
        `${environment.apiUrlNext}/uploads/style.json`,
      );
    });

    it('keeps an absolute media url untouched', async () => {
      trpcMock.mapLayer.list.query.mockResolvedValue([
        mapLayerResponse({
          wms_source: null,
          media_source: {
            documentId: MEDIA_SOURCE_ID,
            url: 'https://cdn.example.org/layer.geojson',
            name: 'layer.geojson',
          },
        }),
      ]);

      const layers = await service.readGlobalMapLayers([], ORGANIZATION_ID);

      expect(layers[0].source?.url).toBe('https://cdn.example.org/layer.geojson');
    });

    it('answers an empty list if the query fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      trpcMock.mapLayer.list.query.mockRejectedValue(new Error('offline'));

      expect(await service.readGlobalMapLayers([], ORGANIZATION_ID)).toEqual([]);
    });
  });

  describe('convertMapLayerToApi', () => {
    it('sends a wms source as documentId and keeps identity and organization out of the payload', () => {
      const layer = {
        documentId: MAP_LAYER_ID,
        id: 7,
        label: 'Layer',
        serverLayerName: 'layer-name',
        type: 'wms',
        public: true,
        owner: true,
        managed: false,
        hidden: false,
        opacity: 0.5,
        zIndex: 3,
        fullId: 'full-id',
        source: localWmsSource(),
      } as unknown as MapLayer;

      const data = service.convertMapLayerToApi(layer);

      expect(data.wms_source).toBe(WMS_SOURCE_ID);
      expect(data.media_source).toBe(undefined);
      expect(data.custom_source).toBe(undefined);
      expect(data.label).toBe('Layer');
      expect(data.type).toBe('wms');
      expect(data.public).toBe(true);
      expect('organization' in data).toBe(false);
      expect(data.documentId).toBe(undefined);
      expect(data.options?.['id']).toBe(undefined);
      expect(data.options?.['documentId']).toBe(undefined);
      expect(data.options?.['fullId']).toBe(undefined);
      expect(data.options?.['source']).toBe(undefined);
      expect(data.options?.['opacity']).toBe(0.5);
    });

    it('sends a media source as documentId and a source without documentId as custom_source', () => {
      const mediaLayer = {
        label: 'Media',
        serverLayerName: null,
        type: 'geojson',
        public: false,
        owner: true,
        source: { documentId: MEDIA_SOURCE_ID, url: 'https://cdn.example.org/layer.geojson' },
      } as unknown as MapLayer;
      const customLayer = {
        label: 'Custom',
        serverLayerName: 'custom',
        type: 'wms_custom',
        public: false,
        owner: true,
        source: { url: 'https://custom.example.org/' },
      } as unknown as MapLayer;

      expect(service.convertMapLayerToApi(mediaLayer).media_source).toBe(MEDIA_SOURCE_ID);
      expect(service.convertMapLayerToApi(mediaLayer).custom_source).toBe(undefined);
      expect(service.convertMapLayerToApi(customLayer).custom_source).toBe('https://custom.example.org/');
      expect(service.convertMapLayerToApi(customLayer).media_source).toBe(undefined);
    });

    it('stores the styleUrl of the new backend relative', () => {
      const layer = {
        label: 'Media',
        serverLayerName: null,
        type: 'geojson',
        public: false,
        owner: true,
        styleSourceType: 'url',
        styleUrl: `${environment.apiUrlNext}/uploads/style.json`,
        source: { documentId: MEDIA_SOURCE_ID, url: 'https://cdn.example.org/layer.geojson' },
      } as unknown as MapLayer;

      expect(service.convertMapLayerToApi(layer).options?.['styleUrl']).toBe('/uploads/style.json');
    });
  });

  describe('saveGlobalMapLayer', () => {
    it('updates an existing layer by documentId', async () => {
      trpcMock.mapLayer.update.mutate.mockResolvedValue(mapLayerResponse());
      const layer = {
        documentId: MAP_LAYER_ID,
        label: 'Layer',
        serverLayerName: 'layer-name',
        type: 'wms',
        public: true,
        owner: true,
        source: localWmsSource(),
      } as unknown as MapLayer;

      const saved = await service.saveGlobalMapLayer(layer, ORGANIZATION_ID);

      expect(trpcMock.mapLayer.create.mutate).not.toHaveBeenCalled();
      const input = trpcMock.mapLayer.update.mutate.mock.calls[0][0];
      expect(input.documentId).toBe(MAP_LAYER_ID);
      expect(input.data.wms_source).toBe(WMS_SOURCE_ID);
      expect('organization' in input.data).toBe(false);
      expect(saved?.fullId).toBe(`https://wms.example.org/|layer-name|${MAP_LAYER_ID}`);
      expect(saved?.owner).toBe(true);
      expect(saved?.managed).toBe(false);
    });

    it('creates a new layer without documentId', async () => {
      trpcMock.mapLayer.create.mutate.mockResolvedValue(mapLayerResponse());
      const layer = {
        label: 'Layer',
        serverLayerName: 'layer-name',
        type: 'wms',
        public: true,
        owner: true,
        source: localWmsSource(),
      } as unknown as MapLayer;

      const saved = await service.saveGlobalMapLayer(layer, ORGANIZATION_ID);

      expect(trpcMock.mapLayer.update.mutate).not.toHaveBeenCalled();
      const input = trpcMock.mapLayer.create.mutate.mock.calls[0][0];
      expect(Object.keys(input)).toEqual(['data']);
      expect(input.data.documentId).toBe(undefined);
      expect(saved?.documentId).toBe(MAP_LAYER_ID);
    });

    it('answers null and does not swallow the error silently if the mutation fails', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      trpcMock.mapLayer.create.mutate.mockRejectedValue(new Error('forbidden'));
      const layer = { label: 'Layer', type: 'wms', public: true, owner: true } as unknown as MapLayer;

      expect(await service.saveGlobalMapLayer(layer, ORGANIZATION_ID)).toBe(null);
      expect(consoleError).toHaveBeenCalled();
    });

    it('saves locally if no organization is active', async () => {
      const layer = {
        label: 'Layer',
        serverLayerName: 'layer-name',
        type: 'wms',
        public: false,
        owner: true,
        source: localWmsSource(),
      } as unknown as MapLayer;

      const saved = await service.saveGlobalMapLayer(layer, undefined);

      expect(trpcMock.mapLayer.create.mutate).not.toHaveBeenCalled();
      expect(dbMock.localMapLayer.put).toHaveBeenCalled();
      expect(saved?.id).toBe(-1);
    });
  });

  describe('saveLocalMapLayer', () => {
    it('keeps the fullId of a layer of the backend', async () => {
      const layer = {
        documentId: MAP_LAYER_ID,
        label: 'Layer',
        serverLayerName: 'layer-name',
        type: 'wms',
        public: true,
        owner: false,
        fullId: `https://wms.example.org/|layer-name|${MAP_LAYER_ID}`,
        source: localWmsSource(),
      } as unknown as MapLayer;

      const saved = await service.saveLocalMapLayer(layer);

      expect(saved.id).toBe(undefined);
      expect(saved.fullId).toBe(`https://wms.example.org/|layer-name|${MAP_LAYER_ID}`);
    });
  });
});

describe('WmsService', () => {
  let service: WmsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = createInjector().get(WmsService);
  });

  describe('readGlobalWMSSources', () => {
    it('reads the flat list of the wmsSource.list query and maps it onto WmsSource', async () => {
      trpcMock.wmsSource.list.query.mockResolvedValue([
        wmsSourceResponse(),
        wmsSourceResponse({ documentId: MEDIA_SOURCE_ID, organization: { documentId: OTHER_ORGANIZATION_ID } }),
        wmsSourceResponse({ documentId: MAP_LAYER_ID, organization: null, label: null, url: null, type: null }),
      ]);

      const sources = await service.readGlobalWMSSources(ORGANIZATION_ID);

      expect(trpcMock.wmsSource.list.query).toHaveBeenCalledTimes(1);
      expect(sources[0]).toEqual({
        documentId: WMS_SOURCE_ID,
        url: 'https://wms.example.org/',
        label: 'Source',
        type: 'wms',
        attribution: undefined,
        public: true,
        owner: true,
      });
      expect(sources[1].owner).toBe(false);
      expect(sources[2].owner).toBe(false);
      expect(sources[2].url).toBe('');
      expect(sources[2].label).toBe('');
      expect(sources[2].type).toBe('wms');
    });

    it('answers an empty list if the query fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      trpcMock.wmsSource.list.query.mockRejectedValue(new Error('offline'));

      expect(await service.readGlobalWMSSources(ORGANIZATION_ID)).toEqual([]);
    });
  });

  describe('saveGlobalWMSSource', () => {
    it('updates an existing source by documentId without sending the organization', async () => {
      trpcMock.wmsSource.update.mutate.mockResolvedValue(wmsSourceResponse({ label: 'Renamed' }));

      const saved = await service.saveGlobalWMSSource({ ...localWmsSource(), label: 'Renamed' }, ORGANIZATION_ID);

      expect(trpcMock.wmsSource.create.mutate).not.toHaveBeenCalled();
      const input = trpcMock.wmsSource.update.mutate.mock.calls[0][0];
      expect(input.documentId).toBe(WMS_SOURCE_ID);
      expect(input.data).toEqual({
        label: 'Renamed',
        type: 'wms',
        url: 'https://wms.example.org/',
        attribution: undefined,
        public: true,
      });
      expect(saved?.label).toBe('Renamed');
      expect(saved?.owner).toBe(true);
    });

    it('creates a new source and derives the owner from the returned organization', async () => {
      trpcMock.wmsSource.create.mutate.mockResolvedValue(wmsSourceResponse());
      const source: WmsSource = {
        url: 'https://wms.example.org/',
        label: 'Source',
        type: 'wms',
        owner: true,
        public: true,
      };

      const saved = await service.saveGlobalWMSSource(source, ORGANIZATION_ID);

      expect(trpcMock.wmsSource.update.mutate).not.toHaveBeenCalled();
      expect(Object.keys(trpcMock.wmsSource.create.mutate.mock.calls[0][0])).toEqual(['data']);
      expect(saved?.documentId).toBe(WMS_SOURCE_ID);
      expect(saved?.owner).toBe(true);
    });

    it('does not persist a source of another organization', async () => {
      const saved = await service.saveGlobalWMSSource({ ...localWmsSource(), owner: false }, ORGANIZATION_ID);

      expect(saved).toBe(null);
      expect(trpcMock.wmsSource.create.mutate).not.toHaveBeenCalled();
      expect(trpcMock.wmsSource.update.mutate).not.toHaveBeenCalled();
    });

    it('answers null and logs if the mutation fails', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      trpcMock.wmsSource.update.mutate.mockRejectedValue(new Error('forbidden'));

      expect(await service.saveGlobalWMSSource(localWmsSource(), ORGANIZATION_ID)).toBe(null);
      expect(consoleError).toHaveBeenCalled();
    });
  });
});
