import { eq } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import {
  mapLayerGenerationConfig,
  type MapLayerGenerationConfigInsert,
  type MapLayerGenerationConfigRow,
} from './schema.js';

export const getConfig = async (db: Database): Promise<MapLayerGenerationConfigRow | null> => {
  const [row] = await db.select().from(mapLayerGenerationConfig).limit(1);
  return row ?? null;
};

export const insertConfig = async (
  db: Database,
  values: Partial<MapLayerGenerationConfigInsert> = {},
): Promise<MapLayerGenerationConfigRow> => {
  const [row] = await db.insert(mapLayerGenerationConfig).values(values).returning();
  return row;
};

export const updateConfig = async (
  db: Database,
  documentId: string,
  values: Partial<MapLayerGenerationConfigInsert>,
): Promise<MapLayerGenerationConfigRow | null> => {
  const [row] = await db
    .update(mapLayerGenerationConfig)
    .set({
      ...values,
      updatedAt: new Date(),
    })
    .where(eq(mapLayerGenerationConfig.documentId, documentId))
    .returning();
  return row ?? null;
};

export const initOrGetConfig = async (db: Database): Promise<MapLayerGenerationConfigRow> => {
  const existing = await getConfig(db);
  if (existing) {
    return existing;
  }
  return await insertConfig(db);
};

export const updateSingleConfig = async (
  db: Database,
  values: Partial<MapLayerGenerationConfigInsert>,
): Promise<MapLayerGenerationConfigRow> => {
  const config = await initOrGetConfig(db);
  const updated = await updateConfig(db, config.documentId, values);
  return updated ?? config;
};

export const updateExecutionDates = async (
  db: Database,
  documentId: string,
  dates: { lastStartDate?: Date | null; lastEndDate?: Date | null },
): Promise<MapLayerGenerationConfigRow | null> => {
  return await updateConfig(db, documentId, dates);
};
