import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { customSession } from 'better-auth/plugins/custom-session';
import { username } from 'better-auth/plugins/username';
import { type Database, db } from '../db/client.js';
import * as schema from '../db/schema.js';
import { env } from '../env.js';
import { getOrganization } from '../modules/organization/repository.js';
import { ROLE_PERMISSIONS } from './permissions.js';
import { ROLES } from './roles.js';
import { shareAccess } from './share-access-plugin.js';
import type { BetterAuthClientPlugin } from 'better-auth/client';

export const createCustomSession = async <
  User extends { zsRole: string; organizationId?: string | null },
  Session extends { operationId?: string | null; organizationId?: string | null },
>(
  database: Database,
  { user, session }: { user: User; session: Session },
) => {
  const organizationId = session.organizationId ?? user.organizationId;

  return {
    user,
    session,
    zsRole: user.zsRole,
    operationId: session.operationId,
    organization: organizationId ? await getOrganization(database, { organizationId }) : null,
  };
};

const authOptions = {
  appName: 'ZSKarte',
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 6,
  },
  user: {
    additionalFields: {
      organizationId: { type: 'string', required: false, input: false },
      zsRole: { type: [...ROLES], required: true, defaultValue: 'public', input: false },
    },
  },
  session: {
    additionalFields: {
      operationId: { type: 'string', required: false, input: false },
      organizationId: { type: 'string', required: false, input: false },
      permission: { type: ['read', 'write', 'all'], required: false, input: false },
    },
  },
  plugins: [username({ displayUsername: false }), shareAccess()],
  trustedOrigins: env.TRUSTED_ORIGINS,
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: 'database',
  },
  advanced: {
    useSecureCookies: env.isProduction,
  },
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...authOptions,
  plugins: [
    ...authOptions.plugins,
    customSession((session) => createCustomSession(db, session), authOptions),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
export type Auth = typeof auth;
export type ShareAccessPlugin = typeof shareAccess;
export { ROLE_PERMISSIONS };
