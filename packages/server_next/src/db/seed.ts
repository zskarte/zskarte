import { eq } from 'drizzle-orm';
import { pathToFileURL } from 'node:url';
import { auth } from '../auth/auth.js';
import { user } from './auth-schema.js';
import { logger } from '../lib/logger.js';
import { mapLayerGenerationConfig } from '../modules/map-layer-generation/schema.js';
import { organizations } from '../modules/organization/schema.js';
import { closeDatabase, db } from './client.js';

const BASELINE_ORGANIZATIONS = [
  { name: 'ZSO Development' },
  // organization the guest users belong to
  { name: 'ZSO Gast' },
];

const BASELINE_USERS = [
  { username: 'zso_guest', email: 'zso_guest@internal.zskarte.ch', password: 'zsogast', role: 'guest' },
  { username: 'operation_read', email: 'operation_read@internal.zskarte.ch', role: 'operationread' },
  { username: 'operation_write', email: 'operation_write@internal.zskarte.ch', role: 'operationwrite' },
  { username: 'operation_all', email: 'operation_all@internal.zskarte.ch', role: 'organization' },
] as const;

const seedOrganizations = async (): Promise<void> => {
  for (const organization of BASELINE_ORGANIZATIONS) {
    const [existing] = await db
      .select({ documentId: organizations.documentId })
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
  const [existing] = await db.select({ documentId: mapLayerGenerationConfig.documentId }).from(mapLayerGenerationConfig).limit(1);
  if (existing) {
    logger.info('map layer generation config already present');
    return;
  }
  await db.insert(mapLayerGenerationConfig).values({});
  logger.info('map layer generation config created');
};

const seedUsers = async (): Promise<void> => {
  const [guestOrganization] = await db
    .select({ documentId: organizations.documentId })
    .from(organizations)
    .where(eq(organizations.name, 'ZSO Gast'))
    .limit(1);
  if (!guestOrganization) throw new Error('Guest organization is missing');

  for (const baselineUser of BASELINE_USERS) {
    const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.username, baselineUser.username)).limit(1);
    if (existing) continue;

    const password = 'password' in baselineUser ? baselineUser.password : crypto.randomUUID();
    const authContext = await auth.$context;
    const created = await authContext.internalAdapter.createUser(
      {
        name: baselineUser.username,
        email: baselineUser.email,
        emailVerified: true,
        username: baselineUser.username,
        zsRole: baselineUser.role,
        organizationId: baselineUser.role === 'guest' ? guestOrganization.documentId : null,
      },
      { method: 'email-password' },
    );
    await authContext.internalAdapter.linkAccount({
      accountId: created.id,
      providerId: 'credential',
      issuer: 'local:credential',
      userId: created.id,
      password: await authContext.password.hash(password),
    });
    logger.info({ username: baselineUser.username, role: baselineUser.role }, 'auth user created');
  }
};

export const seed = async (): Promise<void> => {
  await seedOrganizations();
  await seedUsers();
  await seedMapLayerGenerationConfig();
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
