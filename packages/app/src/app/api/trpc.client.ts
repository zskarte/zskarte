import { createTRPCClient, httpBatchLink, splitLink } from '@trpc/client';
import type { AppRouter } from '@zskarte/server-next/router';
import superjson from 'superjson';
import { environment } from '../../environments/environment';

const trpcUrl = `${environment.apiUrlNext}/trpc`;

// the better-auth session cookie authenticates every call, so credentials have to be sent
const httpLink = httpBatchLink({
  url: trpcUrl,
  transformer: superjson,
  fetch: (url, options) => fetch(url, { ...options, credentials: 'include' }),
  maxURLLength: 2083,
});

/**
 * The single typed tRPC client of the app. Domain traffic goes over http, the
 * subscription branch of the split link is the seam for the websocket link that
 * replaces socket.io later on.
 */
export const trpc = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.type === 'subscription',
      // TODO: replace with `wsLink` once the realtime subscriptions land
      true: httpLink,
      false: httpLink,
    }),
  ],
});
