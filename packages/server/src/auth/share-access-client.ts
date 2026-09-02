import type { BetterAuthClientPlugin } from 'better-auth/client';
import type { auth } from './auth.js';
import type { shareAccess } from './share-access-plugin.js';

export type Auth = typeof auth;

export const shareAccessClient = () =>
  ({
    id: 'infer-server-plugin',
    version: '1.0.0',
    $InferServerPlugin: {} as ReturnType<typeof shareAccess>,
  }) satisfies BetterAuthClientPlugin;
