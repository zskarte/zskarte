import { eq } from 'drizzle-orm';
import { pathToFileURL } from 'node:url';
import { logger } from '../lib/logger.js';
import { mapLayerGenerationConfig } from '../modules/map-layer-generation/schema.js';
import { organizations } from '../modules/organization/schema.js';
import { closeDatabase, db } from './client.js';

const BASELINE_ORGANIZATIONS = [
  { name: 'ZSO Development' },
  // organization the guest users belong to
  { name: 'ZSO Gast' },
];

const seedOrganizations = async (): Promise<void> => {
  for (const organization of BASELINE_ORGANIZATIONS) {
    const [existing] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.name, organization.name))
      .limit(1);

    if (existing) {
      logger.info({ name: organization.name }, 'organization already present');
      continue;
    }

    const [created] = await db.insert(organizations).values(organization).returning();
    logger.info({ name: created!.name, documentId: created!.documentId }, 'organization created');
  }
};

const seedMapLayerGenerationConfig = async (): Promise<void> => {
  const [existing] = await db.select({ id: mapLayerGenerationConfig.id }).from(mapLayerGenerationConfig).limit(1);
  if (existing) {
    logger.info('map layer generation config already present');
    return;
  }
  await db.insert(mapLayerGenerationConfig).values({});
  logger.info('map layer generation config created');
};

export const seed = async (): Promise<void> => {
  await seedOrganizations();
  await seedMapLayerGenerationConfig();
  // users, roles and share link pseudo users are created by the better-auth seed
  logger.info('seed completed');
};

const isMain = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isMain) {
  seed()
    .then(() => closeDatabase())
    .catch(async (error) => {
      logger.fatal({ err: error }, 'seed failed');
      await closeDatabase().catch(() => undefined);
      process.exit(1);
    });
}
