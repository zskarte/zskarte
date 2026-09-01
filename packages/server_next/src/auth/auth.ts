import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { username } from 'better-auth/plugins/username';
import { db } from '../db/client.js';
import * as schema from '../db/schema.js';
import { env } from '../env.js';
import { ROLE_PERMISSIONS } from './permissions.js';
import { ROLES } from './roles.js';
import { shareAccess } from './share-access-plugin.js';

export const auth = betterAuth({
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
});

export type AuthSession = typeof auth.$Infer.Session;
export { ROLE_PERMISSIONS };
