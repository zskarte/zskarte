import { DatePipe } from '@angular/common';
import { ZsMapBaseDrawElement } from '../map-renderer/elements/base/base-draw-element';
import { ZsMapTextDrawElementState } from '@zskarte/types';
import { I18NService } from '../state/i18n.service';
import capitalizeFirstLetter from './capitalizeFirstLetter';
import { getCenter } from 'ol/extent';
import saveAs from 'file-saver';
import { convertTo, ZsKarteProjection } from './projections';
import { SimpleGeometry } from 'ol/geom';

export function mapListViewEntry(
  elements: ZsMapBaseDrawElement[],
  datePipe: DatePipe,
  i18n: I18NService,
  currentLocale: string,
  projection: ZsKarteProjection,
  numerical: boolean,
): ListViewEntry[] {
  return elements.map((element) => {
    const olFeature = element.getOlFeature();
    const sig = olFeature.get('sig');
    const sk: string = sig.kat ? 'sign' + capitalizeFirstLetter(sig.kat) : 'csvGroupArea';
    const geometry = element.getOlFeature().getGeometry() as SimpleGeometry;
    const location = JSON.stringify(convertTo(geometry.getCoordinates() || [], projection, numerical));
    const extent = geometry?.getExtent();
    const centroid = convertTo(extent ? getCenter(extent) : [], projection, numerical);
    const reportNumber = (
      Array.isArray(element.elementState?.reportNumber)
        ? element.elementState?.reportNumber
        : [element.elementState?.reportNumber]
    ).join(', ');
    return {
      id: element.getId(),
      date: datePipe.transform(element.elementState?.createdAt, 'dd.MM.yyyy HH:mm'),
      dateNumeric: element.elementState?.createdAt,
      group: sk && i18n.has(sk) ? i18n.get(sk) : '',
      sign: currentLocale === 'fr' ? sig.fr : currentLocale === 'en' ? sig.en : sig.de,
      location,
      reportNumber,
      centroid,
      size: sig.size,

      // if the element is of type text,
      // the name attribute does not exist.
      // However, the "name" is stored inside the "text" attribute
      label: element.elementState?.name || (element.elementState as ZsMapTextDrawElementState)?.text,
      description: element.elementState?.description,
    } as ListViewEntry;
  });
}

export interface ListViewEntry {
  id: string;
  date?: string;
  dateNumeric: number;
  group: string;
  sign: string;
  location: string;
  centroid: string;
  size: string;
  reportNumber: string;
  label: string;
  description: string;
}

export async function exportListViewExcel(listViewEntries: ListViewEntry[], i18n: I18NService, operationName: string) {
  const exceljs = await import('exceljs');
  const { Workbook } = exceljs.default ? exceljs.default : exceljs;
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet('List view entries');
  sheet.columns = [
    { header: i18n.get('csvDate'), key: 'date', width: 15 },
    { header: i18n.get('csvGroup'), key: 'group', width: 15 },
    { header: i18n.get('csvSignatur'), key: 'sign', width: 15 },
    { header: i18n.get('csvLocation'), key: 'location', width: 30 },
    { header: i18n.get('csvReportNumber'), key: 'reportNumber', width: 15 },
    { header: i18n.get('csvLabel'), key: 'label', width: 15 },
    { header: i18n.get('csvDescription'), key: 'description', width: 30 },
  ];
  sheet.addRows(listViewEntries);
  const fileName =
    `${i18n.get('listViewExport')}_${operationName}_${new Date().toISOString().slice(0, 16)}.xlsx`.replaceAll(
      /[^a-zA-Z0-9._-]/g,
      '_',
    );
  return workbook.xlsx.writeBuffer().then((buffer: BlobPart) => {
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName);
  });
}
