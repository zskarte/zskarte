import { createTRPCClient, createWSClient, httpBatchLink, splitLink, wsLink } from '@trpc/client';
import type { AppRouter } from '@zskarte/server-next/router';
import superjson from 'superjson';
import { environment } from '../../environments/environment';

const trpcUrl = `${environment.apiUrl}/trpc`;
const wsUrl = new URL(trpcUrl);
wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:';

// the better-auth session cookie authenticates every call, so credentials have to be sent
const httpLink = httpBatchLink({
  url: trpcUrl,
  transformer: superjson,
  fetch: (url, options) => fetch(url, { ...options, credentials: 'include' }),
  maxURLLength: 2083,
});

const wsClient = createWSClient({
  url: wsUrl.toString(),
  lazy: { enabled: true, closeMs: 1_000 },
});

/**
 * The single typed tRPC client of the app. Domain traffic goes over HTTP and
 * subscriptions share one lazy WebSocket connection.
 */
export const trpc = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: wsLink({ client: wsClient, transformer: superjson }),
      false: httpLink,
    }),
  ],
});
