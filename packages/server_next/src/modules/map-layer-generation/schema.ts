import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { documentId, timestamps } from '../../db/columns.js';
import { files } from '../file/schema.js';

export const DEFAULT_CANTONS = 'AG,AI,AR,BE,BL,BS,FR,GE,GL,GR,JU,LU,NE,NW,OW,SG,SH,SO,SZ,TG,TI,UR,VD,VS,ZG,ZH';
export const DEFAULT_URL_MADD = 'https://public.madd.bfs.admin.ch/${canton}.zip';
export const DEFAULT_URL_SWISS_BOUNDARIES_3D =
  'https://data.geo.admin.ch/ch.swisstopo.swissboundaries3d/swissboundaries3d_${year}-${month}/swissboundaries3d_${year}-${month}_2056_5728.shp.zip';
export const DEFAULT_URL_SWISS_NAMES_3D =
  'https://data.geo.admin.ch/ch.swisstopo.swissnames3d/swissnames3d_${year}/swissnames3d_${year}_2056.csv.zip';
export const DEFAULT_FIELDS_SWISS_NAMES_3D = 'OBJEKTART,OBJEKTKLASSE_TLM,EINWOHNERKATEGORIE,NAME,E,N';
export const DEFAULT_FILE_SWISS_NAMES_3D = 'swissNAMES3D_PLY';

/** Single row configuration table, replaces the strapi single type. */
export const mapLayerGenerationConfig = pgTable('map_layer_generation_config', {
  id: serial('id').primaryKey(),
  documentId: documentId(),
  enabled: boolean('enabled').notNull().default(false),
  allwaysCreateDistrict: boolean('allways_create_district').notNull().default(false),
  cantons: text('cantons').notNull().default(DEFAULT_CANTONS),
  urlMadd: text('url_madd').notNull().default(DEFAULT_URL_MADD),
  styleEntrancesId: integer('style_entrances_id').references(() => files.id, { onDelete: 'set null' }),
  urlSwissBoundaries3d: text('url_swiss_boundaries_3d').notNull().default(DEFAULT_URL_SWISS_BOUNDARIES_3D),
  styleSwissBoundaries3dId: integer('style_swiss_boundaries_3d_id').references(() => files.id, {
    onDelete: 'set null',
  }),
  urlSwissNames3d: text('url_swiss_names_3d').notNull().default(DEFAULT_URL_SWISS_NAMES_3D),
  styleSwissNames3dId: integer('style_swiss_names_3d_id').references(() => files.id, { onDelete: 'set null' }),
  fieldsSwissNames3d: text('fields_swiss_names_3d').notNull().default(DEFAULT_FIELDS_SWISS_NAMES_3D),
  fileSwissNames3d: text('file_swiss_names_3d').notNull().default(DEFAULT_FILE_SWISS_NAMES_3D),
  lastStartDate: timestamp('last_start_date', { withTimezone: true }),
  lastEndDate: timestamp('last_end_date', { withTimezone: true }),
  ...timestamps,
});

export type MapLayerGenerationConfigRow = typeof mapLayerGenerationConfig.$inferSelect;
export type MapLayerGenerationConfigInsert = typeof mapLayerGenerationConfig.$inferInsert;
