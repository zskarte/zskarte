import capitalizeFirstLetter from '../helper/capitalizeFirstLetter';
import { convertTo, ZsKarteProjection } from '../helper/projections';
import { boundingExtent, getCenter } from 'ol/extent';
import saveAs from 'file-saver';
import { ChangeEntry, INITIAL_CHANGESET_ID, IZsMapOperation, ZsMapState } from '@zskarte/types';
import { getElement, getElementChangeInfos } from '@zskarte/common';
import { Signs } from '../map-renderer/signs';
import { applyPatches } from 'immer';
import { I18NService } from '../state/i18n.service';
import { DatePipe } from '@angular/common';
import _ from 'lodash';
import { SigningService } from '../changeset/signing.service';

export async function mapChangeEntry(
  mapState: ZsMapState,
  datePipe: DatePipe,
  i18n: I18NService,
  signing: SigningService,
  operation: IZsMapOperation,
  projection: ZsKarteProjection,
  numerical: boolean,
): Promise<ChangeEntry[]> {
  if (!operation.changesets || !mapState.changesetIds) {
    return [];
  }
  await signing.loadAllKeys(operation);

  const changesetIds = [...mapState.changesetIds];
  changesetIds.reverse();

  const changes: ChangeEntry[] = [];
  //logic similar to helpers.updateDescription, but show all changed fieldnames for all elements
  for (const changesetId of changesetIds) {
    const changeset = operation.changesets[changesetId];
    if (!changeset) {
      if (changesetId !== INITIAL_CHANGESET_ID) {
        console.error(`changeset with id ${changesetId} is not in operation.changesets`);
      }
      continue;
    }
    const signValid = await signing.verifyChangesetSign(changeset, operation);

    const dateNumeric = changeset.endAt || changeset.startAt;
    const change: ChangeEntry = {
      changesetId: changeset.id,
      date: datePipe.transform(dateNumeric, 'dd.MM.yyyy HH:mm'),
      dateNumeric,
      signValid,
      author: changeset.author,
    } as ChangeEntry;

    for (const elemId of changeset.changedDrawElements) {
      const element = getElement(mapState, changeset.patches, changeset.inversePatches, elemId);
      const label = element?.name || (element as any)?.text;
      const description = element?.description || '';
      const infos = getElementChangeInfos(changeset, elemId);
      const changedProperties = [...(infos.changedProperties || [])].sort().join(', ');
      const sig = Signs.getSignById(element?.symbolId);
      const sk: string = sig?.kat ? 'sign' + capitalizeFirstLetter(sig.kat) : 'csvGroupArea';

      const group = sk && i18n.has(sk) ? i18n.get(sk) : '';
      const sign = sig ? i18n.getLabelForSign(sig) : element?.type || '';
      let coords: any = element?.coordinates || [];
      const location = JSON.stringify(convertTo(coords, projection, numerical));
      //prepare coords for calc Extent
      while (coords.length > 0 && coords[0].length > 0 && typeof coords[0][0] !== 'number') {
        coords = _.flatten(coords);
      }
      if (coords.length > 0 && typeof coords[0] === 'number') {
        coords = [coords];
      }
      const extent = boundingExtent(coords);
      const centroid = convertTo(extent ? getCenter(extent) : [], projection, numerical) as string;
      const reportNumber = (
        Array.isArray(element?.reportNumber) ?
          element?.reportNumber
        : [element?.reportNumber]).join(', ');

      changes.push({
        ...change,
        elemId,
        action: infos.action,
        coordChange: infos.coordChange,
        changedProperties,

        group,
        sign,
        location,
        centroid,
        reportNumber,
        label,
        description,
        changeset,
      });
    }
    mapState = applyPatches(mapState, changeset.inversePatches);
  }
  return changes;
}

export async function exportChangeExcel(changeEntries: ChangeEntry[], i18n: I18NService, operationName: string) {
  const exceljs = await import('exceljs');
  const { Workbook } = exceljs.default ? exceljs.default : exceljs;
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet('change entries');
  sheet.columns = [
    { header: i18n.get('csvChangesetId'), key: 'changesetId', width: 40 },
    { header: i18n.get('csvChangeDate'), key: 'date', width: 20 },
    { header: i18n.get('csvSignValid'), key: 'signValid', width: 10 },
    { header: i18n.get('csvAuthor'), key: 'author', width: 25 },
    { header: i18n.get('csvElemId'), key: 'elemId', width: 40 },
    { header: i18n.get('csvAction'), key: 'action', width: 10 },
    { header: i18n.get('csvGroup'), key: 'group', width: 15 },
    { header: i18n.get('csvSignatur'), key: 'sign', width: 25 },
    { header: i18n.get('csvChangedProperties'), key: 'changedProperties', width: 50 },
    { header: i18n.get('csvCoordChange'), key: 'coordChange', width: 10 },
    { header: i18n.get('csvLocation'), key: 'location', width: 50 },
    { header: i18n.get('csvReportNumber'), key: 'reportNumber', width: 15 },
    { header: i18n.get('csvLabel'), key: 'label', width: 25 },
    { header: i18n.get('csvDescription'), key: 'description', width: 50 },
  ];
  sheet.addRows(changeEntries);
  const fileName =
    `${i18n.get('changeTableExport')}_${operationName}_${new Date().toISOString().slice(0, 16)}.xlsx`.replaceAll(
      /[^a-zA-Z0-9._-]/g,
      '_',
    );
  return workbook.xlsx.writeBuffer().then((buffer: BlobPart) => {
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName);
  });
}
