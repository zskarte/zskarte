import { webcrypto } from 'node:crypto';
import type { IZsSignKeyType } from '@zskarte/types';
import { describe, expect, it } from 'vitest';
import {
  createNewSigningKeyPair,
  resolveSigningPassphrase,
  restoreSigningKeyPair,
  signData,
  verifyData,
} from '../src/lib/signing.js';
import { signingKeyRouter } from '../src/modules/signing-key/router.js';
import { createCallerFactory } from '../src/trpc/trpc.js';
import { createMockDb, createTestContext } from './helpers/index.js';

const SERVER_ID = 'host:test-host-10.0.0.1';

const storedKey = {
  keyId: 'e3b0c442-98fc-1c14-9afb-f4c8996fb924',
  serverId: SERVER_ID,
  keyType: 'ed25519' as IZsSignKeyType,
  publicKey: 'cHVibGljLWtleQ==',
  validFrom: new Date('2024-01-01T00:00:00.000Z'),
  validUntil: null,
};

const createCaller = async (db = createMockDb().db) =>
  createCallerFactory(signingKeyRouter)(await createTestContext({ db }));

/** mirrors `packages/app/.../changeset/signing.service.ts` */
const verifyInBrowserStyle = async (
  keyType: IZsSignKeyType,
  publicKeyBase64: string,
  data: object,
  signature: string,
) => {
  const algorithm =
    keyType === 'rsa' ? { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' } : ({ name: 'Ed25519' } as any);
  const publicKey = await webcrypto.subtle.importKey('spki', Buffer.from(publicKeyBase64, 'base64'), algorithm, false, [
    'verify',
  ]);
  const sortedKeys = Object.keys(data as Record<string, unknown>).sort();
  const payload = JSON.stringify(
    sortedKeys.reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = (data as Record<string, unknown>)[key];
      return acc;
    }, {}),
  );
  return webcrypto.subtle.verify(algorithm, publicKey, Buffer.from(signature, 'base64'), Buffer.from(payload));
};

describe('signingKey.byKeyId', () => {
  it('is public and returns public material only', async () => {
    const { db, captured } = createMockDb({ selects: [[storedKey]] });
    const caller = await createCaller(db);

    const result = await caller.byKeyId({ keyId: storedKey.keyId });

    expect(result).toEqual(storedKey);
    expect(result).not.toHaveProperty('privateKeyEncrypted');
    const projectionKeys = Object.keys(captured.selects[0].fields as Record<string, unknown>);
    expect(projectionKeys).toEqual(['keyId', 'serverId', 'keyType', 'publicKey', 'validFrom', 'validUntil']);
    expect(projectionKeys).not.toContain('privateKeyEncrypted');
  });

  it('returns null for an unknown key instead of throwing', async () => {
    const { db } = createMockDb({ selects: [[]] });
    const caller = await createCaller(db);

    await expect(caller.byKeyId({ keyId: 'unknown' })).resolves.toBeNull();
  });
});

describe('signing round trip', () => {
  const passphrase = resolveSigningPassphrase();

  it('has a usable passphrase from the environment', () => {
    expect(passphrase).not.toBeNull();
    expect((passphrase as Buffer).length).toBeGreaterThanOrEqual(32);
  });

  it.each<IZsSignKeyType>(['ed25519', 'rsa'])('creates a %s key pair the browser can verify', async (keyType) => {
    const { config, material } = createNewSigningKeyPair(SERVER_ID, passphrase, keyType);
    const data = { id: 'changeset-1', serverId: SERVER_ID, signKeyId: config.keyId };

    const signature = signData(data, config.privateKeyObject, keyType);

    expect(verifyData(data, signature, config.publicKeyObject, keyType)).toBe(true);
    expect(material.keyType).toBe(keyType);
    expect(material.privateKeyEncrypted).toBeTypeOf('string');
    await expect(verifyInBrowserStyle(keyType, material.publicKey, data, signature)).resolves.toBe(true);
  });

  it('restores a stored key pair with the passphrase', () => {
    const { config, material } = createNewSigningKeyPair(SERVER_ID, passphrase, 'ed25519');

    const restored = restoreSigningKeyPair(SERVER_ID, { ...material, keyType: 'ed25519' }, passphrase as Buffer);

    expect(restored.keyId).toBe(config.keyId);
    const signature = signData({ foo: 'bar' }, restored.privateKeyObject, 'ed25519');
    expect(verifyData({ foo: 'bar' }, signature, config.publicKeyObject, 'ed25519')).toBe(true);
  });

  it('fails to restore a key pair with a wrong passphrase', () => {
    const { material } = createNewSigningKeyPair(SERVER_ID, passphrase, 'ed25519');

    expect(() => restoreSigningKeyPair(SERVER_ID, { ...material, keyType: 'ed25519' }, Buffer.alloc(32, 7))).toThrow();
  });
});
