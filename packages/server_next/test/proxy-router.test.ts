import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Logger } from '../src/lib/logger.js';
import { createProxyRouter } from '../src/modules/misc/proxy.router.js';
import { createContextInner } from '../src/trpc/context.js';
import { createCallerFactory } from '../src/trpc/trpc.js';

const ALLOWED_HOSTS = ['example.com', '*.geo.admin.ch', 'localhost', '127.0.0.1', '10.0.0.5'];

const silentLogger = () => ({ error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() }) as unknown as Logger;

const fetchMock = vi.fn<typeof globalThis.fetch>();

const createCaller = async (logger = silentLogger()) =>
  createCallerFactory(createProxyRouter(ALLOWED_HOSTS))(await createContextInner({ logger }));

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('proxy.fetch', () => {
  it('forwards parsed json of an allowlisted host', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ layers: ['a', 'b'] }), {
        status: 200,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      }),
    );
    const caller = await createCaller();

    const result = await caller.fetch({ url: 'https://api3.geo.admin.ch/rest/services/api/MapServer/layersConfig' });

    expect(result).toEqual({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      data: { layers: ['a', 'b'] },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('forwards xml capabilities as text', async () => {
    fetchMock.mockResolvedValue(
      new Response('<WMS_Capabilities/>', { status: 200, headers: { 'content-type': 'text/xml' } }),
    );
    const caller = await createCaller();

    const result = await caller.fetch({ url: 'https://example.com/wms?REQUEST=GetCapabilities' });

    expect(result).toEqual({ status: 200, contentType: 'text/xml', data: '<WMS_Capabilities/>' });
  });

  it('rejects a host outside the allowlist', async () => {
    const caller = await createCaller();

    await expect(caller.fetch({ url: 'https://evil.example.org/steal' })).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(['file:///etc/passwd', 'ftp://example.com/data.zip'])('rejects the scheme of %s', async (url) => {
    const caller = await createCaller();

    await expect(caller.fetch({ url })).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(['http://localhost:1338/internal', 'http://127.0.0.1/internal', 'http://10.0.0.5/internal'])(
    'blocks the ssrf target %s even though it is allowlisted',
    async (url) => {
      const caller = await createCaller();

      await expect(caller.fetch({ url })).rejects.toMatchObject({ code: 'FORBIDDEN' });
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it('maps an upstream error status to BAD_GATEWAY', async () => {
    fetchMock.mockResolvedValue(new Response('boom', { status: 500 }));
    const logger = silentLogger();
    const caller = await createCaller(logger);

    await expect(caller.fetch({ url: 'https://example.com/broken' })).rejects.toMatchObject({ code: 'BAD_GATEWAY' });
    expect(logger.error).toHaveBeenCalled();
  });

  it('maps a network failure to BAD_GATEWAY', async () => {
    fetchMock.mockRejectedValue(new Error('connection refused'));
    const caller = await createCaller();

    await expect(caller.fetch({ url: 'https://example.com/down' })).rejects.toMatchObject({ code: 'BAD_GATEWAY' });
  });

  it('rejects a url that is not absolute', async () => {
    const caller = await createCaller();

    await expect(caller.fetch({ url: '/api/version' })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});
