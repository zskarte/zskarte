import type { Auth, ShareAccessPlugin } from '@zskarte/server-next/auth';
import { createAuthClient } from 'better-auth/client';
import { customSessionClient, usernameClient } from 'better-auth/client/plugins';
import { environment } from '../../environments/environment';

export const authClient = createAuthClient({
  baseURL: environment.apiUrl,
  fetchOptions: { credentials: 'include' },
  plugins: [
    usernameClient(),
    customSessionClient<Auth>(),
    {
      id: 'infer-server-plugin',
      version: '1.0.0',
      $InferServerPlugin: {} as ReturnType<ShareAccessPlugin>,
    },
  ],
});
