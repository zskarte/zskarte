import { pathToFileURL } from 'node:url';
import { eq } from 'drizzle-orm';
import { auth } from '../auth/auth.js';
import { BASELINE_ROLE_PERMISSIONS } from '../auth/permissions.js';
import { logger } from '../lib/logger.js';
import { mapLayerGenerationConfig } from '../modules/map-layer-generation/schema.js';
import { organizations } from '../modules/organization/schema.js';
import { rolePermissions, user } from './auth-schema.js';
import { closeDatabase, db } from './client.js';

export const ADMIN_ORGANIZATION_NAME = 'Admin';

export const BASELINE_ORGANIZATIONS = [
  { name: 'ZSO Development' },
  { name: 'ZSO Gast' },
  { name: ADMIN_ORGANIZATION_NAME },
] as const;

export const BASELINE_USERS = [
  {
    username: 'zso_admin',
    email: 'zso_admin@internal.zskarte.ch',
    password: 'supersecret123',
    role: 'admin',
    organization: ADMIN_ORGANIZATION_NAME,
  },
  {
    username: 'zso_guest',
    email: 'zso_guest@internal.zskarte.ch',
    password: 'zsogast',
    role: 'guest',
    organization: BASELINE_ORGANIZATIONS[1].name,
  },
  { username: 'operation_read', email: 'operation_read@internal.zskarte.ch', role: 'operationread' },
  { username: 'operation_write', email: 'operation_write@internal.zskarte.ch', role: 'operationwrite' },
  {
    username: 'operation_all',
    email: 'operation_all@internal.zskarte.ch',
    role: 'organization',
    organization: BASELINE_ORGANIZATIONS[0].name,
  },
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
  const [existing] = await db
    .select({ documentId: mapLayerGenerationConfig.documentId })
    .from(mapLayerGenerationConfig)
    .limit(1);
  if (existing) {
    logger.info('map layer generation config already present');
    return;
  }
  await db.insert(mapLayerGenerationConfig).values({});
  logger.info('map layer generation config created');
};

const seedUsers = async (): Promise<void> => {
  const orgs = await db.select({ documentId: organizations.documentId, name: organizations.name }).from(organizations);

  for (const baselineUser of BASELINE_USERS) {
    const [existing] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.username, baselineUser.username))
      .limit(1);
    const organizationId =
      'organization' in baselineUser ? orgs.find((org) => org.name === baselineUser.organization)?.documentId : null;
    if ('organization' in baselineUser && !organizationId) {
      throw new Error(`Cannot seed ${baselineUser.username}: organization ${baselineUser.organization} does not exist`);
    }
    if (existing) {
      if ('organization' in baselineUser) {
        await db.update(user).set({ organizationId, zsRole: baselineUser.role }).where(eq(user.id, existing.id));
        logger.info(
          { username: baselineUser.username, organization: baselineUser.organization },
          'auth user link updated',
        );
      }
      continue;
    }

    const password = 'password' in baselineUser ? baselineUser.password : 'supersecret123';
    const authContext = await auth.$context;
    const created = await authContext.internalAdapter.createUser(
      {
        name: baselineUser.username,
        email: baselineUser.email,
        emailVerified: true,
        username: baselineUser.username,
        zsRole: baselineUser.role,
        organizationId,
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

const seedRolePermissions = async (): Promise<void> => {
  const valuesToInsert: { role: string; permission: string }[] = [];
  for (const [role, perms] of Object.entries(BASELINE_ROLE_PERMISSIONS)) {
    for (const permission of perms) {
      valuesToInsert.push({ role, permission });
    }
  }
  if (valuesToInsert.length === 0) return;

  await db.insert(rolePermissions).values(valuesToInsert).onConflictDoNothing();
  logger.info({ count: valuesToInsert.length }, 'role permissions seeded');
};

export const seed = async (): Promise<void> => {
  await seedOrganizations();
  await seedUsers();
  await seedMapLayerGenerationConfig();
  await seedRolePermissions();
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
