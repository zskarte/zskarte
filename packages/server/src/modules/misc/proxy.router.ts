import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { env } from '../../env.js';
import { publicProcedure } from '../../trpc/procedures.js';
import { router } from '../../trpc/trpc.js';

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 4 * 1024 * 1024;

const TEXTUAL_CONTENT_TYPES = ['text/', 'application/xml', 'application/xhtml', 'application/javascript', '+xml'];

const forbidden = (message: string) => new TRPCError({ code: 'FORBIDDEN', message });

/** `192.168.0.1` style literals, everything else is treated as a hostname */
const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

const isPrivateIpv4 = (hostname: string): boolean => {
  const match = IPV4.exec(hostname);
  if (!match) return false;
  const [a, b] = match.slice(1).map(Number) as [number, number, number, number];
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return a >= 224;
};

const isPrivateIpv6 = (hostname: string): boolean => {
  if (!hostname.startsWith('[') || !hostname.endsWith(']')) return false;
  const address = hostname.slice(1, -1).toLowerCase();
  if (address === '::1' || address === '::' || address.startsWith('fe80') || /^f[cd]/.test(address)) return true;
  // ipv4 mapped/compatible literals such as `::ffff:127.0.0.1`
  const mapped = address.slice(address.lastIndexOf(':') + 1);
  return isPrivateIpv4(mapped);
};

/** blocked regardless of the allowlist, an allowlisted dns name never resolves to these on purpose */
const isSsrfTarget = (hostname: string): boolean => {
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === 'ip6-localhost') return true;
  if (hostname === '[::1]') return true;
  return isPrivateIpv4(hostname) || isPrivateIpv6(hostname);
};

const matchesAllowlist = (hostname: string, allowedHosts: string[]): boolean =>
  allowedHosts.some((entry) => (entry.startsWith('*.') ? hostname.endsWith(entry.slice(1)) : hostname === entry));

const assertAllowed = (target: URL, allowedHosts: string[]): void => {
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    throw forbidden(`Protocol ${target.protocol} is not allowed.`);
  }
  const hostname = target.hostname.toLowerCase();
  if (isSsrfTarget(hostname)) throw forbidden(`Host ${hostname} is not allowed.`);
  if (!matchesAllowlist(hostname, allowedHosts)) throw forbidden(`Host ${hostname} is not allowed.`);
};

const readBody = async (response: Response): Promise<string> => {
  const reader = response.body?.getReader();
  if (!reader) return '';

  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new TRPCError({ code: 'PAYLOAD_TOO_LARGE', message: 'The proxied response is too large.' });
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
};

/**
 * Replacement for the unauthenticated `GET /api/proxy?url=…` of the strapi backend. Same
 * reachability (public), but restricted to `PROXY_ALLOWED_HOSTS` and hardened against ssrf.
 */
export const createProxyRouter = (allowedHosts: string[] = env.PROXY_ALLOWED_HOSTS) =>
  router({
    fetch: publicProcedure
      .input(
        z.object({
          url: z
            .string()
            .min(1)
            .refine((value) => URL.canParse(value), { message: 'url must be an absolute url' }),
        }),
      )
      .query(async ({ ctx, input }) => {
        const target = new URL(input.url);
        assertAllowed(target, allowedHosts);

        let response: Response;
        try {
          response = await globalThis.fetch(target, {
            redirect: 'follow',
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            headers: { accept: 'application/json, text/plain, application/xml;q=0.9, */*;q=0.1' },
          });
        } catch (error) {
          ctx.logger.error({ err: error, url: target.href }, '[proxy::fetch]: upstream request failed');
          if (error instanceof Error && error.name === 'TimeoutError') {
            throw new TRPCError({ code: 'TIMEOUT', message: 'The proxied request timed out.', cause: error });
          }
          throw new TRPCError({ code: 'BAD_GATEWAY', message: 'The proxied request failed.', cause: error });
        }

        // a redirect must not be able to escape the allowlist
        if (response.url && response.url !== target.href) assertAllowed(new URL(response.url), allowedHosts);

        if (!response.ok) {
          ctx.logger.error({ url: target.href, status: response.status }, '[proxy::fetch]: upstream returned an error');
          throw new TRPCError({ code: 'BAD_GATEWAY', message: `Upstream responded with ${response.status}.` });
        }

        const contentType = response.headers.get('content-type') ?? '';
        const isJson = contentType.includes('json');
        const isText = contentType === '' || TEXTUAL_CONTENT_TYPES.some((type) => contentType.includes(type));
        if (!isJson && !isText) {
          throw new TRPCError({
            code: 'UNSUPPORTED_MEDIA_TYPE',
            message: `Content type ${contentType} cannot be proxied.`,
          });
        }

        const body = await readBody(response);
        if (!isJson) return { status: response.status, contentType, data: body };

        try {
          return { status: response.status, contentType, data: JSON.parse(body) as unknown };
        } catch (error) {
          ctx.logger.error({ err: error, url: target.href }, '[proxy::fetch]: upstream sent invalid json');
          throw new TRPCError({
            code: 'BAD_GATEWAY',
            message: 'The proxied response is not valid json.',
            cause: error,
          });
        }
      }),
  });

export const proxyRouter = createProxyRouter();
