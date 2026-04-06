import {
  downloadAndExtractEntrance,
  downloadAndExtractLocality,
  downloadAndExtractSwissBoundaries,
  downloadAndExtractSwissNamesNational,
  extractEntranceDistrict,
  extractLocality,
  extractMunicipality,
  extractSwissNamesCanton,
  loadShpFile,
  prepareSwissNamesContent,
  SwissNamesRow,
} from '../state/maplayer';
import type { FeatureCollection } from 'geojson';
import { parentPort, isMainThread } from 'worker_threads';

if (isMainThread) {
  throw new Error('MapLayerProcessor need to run as worker');
}

const featureCollectionFileCache = new Map<string, FeatureCollection>();
const nameCache: { names: SwissNamesRow[] } = { names: null };

const postLog = (message:string, level = 'info') => {
  parentPort.postMessage({
    type: 'LOG',
    message,
    level
  });
}

parentPort.on('message', async (data) => {
  try {
    let result: any;
    if (data.func === 'downloadAndExtractSwissBoundaries') {
      result = await downloadAndExtractSwissBoundaries(data.params);
    } else if (data.func === 'loadShpFile') {
      result = await loadShpFile(data.params);
    } else if (data.func === 'downloadAndExtractEntrance') {
      result = await downloadAndExtractEntrance(data.params, featureCollectionFileCache);
    } else if (data.func === 'extractEntranceDistrict') {
      result = await extractEntranceDistrict(data.params, featureCollectionFileCache);
    } else if (data.func === 'removeFileCache') {
      result = featureCollectionFileCache.delete(data.params);
    } else if (data.func === 'extractMunicipality') {
      result = await extractMunicipality(data.params, featureCollectionFileCache);
    } else if (data.func === 'downloadAndExtractLocality') {
      result = await downloadAndExtractLocality(data.params);
    } else if (data.func === 'extractLocality') {
      result = await extractLocality(data.params, featureCollectionFileCache);
    } else if (data.func === 'downloadAndExtractSwissNamesNational') {
      result = await downloadAndExtractSwissNamesNational(data.params);
    } else if (data.func === 'extractSwissNamesCanton') {
      result = await extractSwissNamesCanton(data.params, nameCache);
    } else if (data.func === 'prepareSwissNamesContent') {
      result = await prepareSwissNamesContent(data.params);
    } else if (data.func === 'shutdown') {
      parentPort.postMessage({
        type: 'RESULT',
        id: data.id,
        func: data.func,
        value: true,
      });
      process.exit(0); // stop worker gracefully
    } else {
      throw new Error(`func '${data.func}' unknown.`);
    }
    parentPort.postMessage({
      type: 'RESULT',
      id: data.id,
      func: data.func,
      value: result,
    });
  } catch (error) {
    parentPort.postMessage({
      type: 'ERROR',
      id: data.id,
      func: data.func,
      value: { error, stack: error.stack },
    });
  }
});
