import {
  type KeyObject,
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  randomBytes,
  randomUUID,
  sign,
  verify,
} from 'node:crypto';
import { hostname, networkInterfaces } from 'node:os';
import type { IZsSignKeyType } from '@zskarte/types';
import { env } from '../env.js';

/**
 * Port of the strapi `utils/signing.ts`. Crypto parameters, encodings (base64/spki/pkcs8) and the
 * key id derivation stay identical, `packages/app/.../changeset/signing.service.ts` verifies these
 * signatures in the browser.
 */
const rsaSigningAlgorithm = 'RSA-SHA256';
const activeKeyType: IZsSignKeyType = env.SIGN_KEY_TYPE === 'rsa' ? 'rsa' : 'ed25519';

export interface SigningKeyConfig {
  keyId: string;
  serverId: string;
  keyType: IZsSignKeyType;
  privateKeyObject: KeyObject;
  publicKeyObject: KeyObject;
}

/** Persistable material of a freshly created key pair, written by `signing-key/repository.ts`. */
export interface SigningKeyMaterial {
  keyId: string;
  serverId: string;
  keyType: IZsSignKeyType;
  privateKeyEncrypted: string | null;
  publicKey: string;
  validFrom: Date;
  validUntil: null;
}

export interface NewSigningKeyPair {
  config: SigningKeyConfig;
  material: SigningKeyMaterial;
}

export interface StoredSigningKey {
  keyId: string;
  keyType: IZsSignKeyType;
  privateKeyEncrypted: string | null;
  publicKey: string;
}

/** local copy of `sortKeysDeep` of `@zskarte/common` (that package pulls openlayers into the server). */
export const sortKeysDeep = (data: unknown): unknown => {
  if (Array.isArray(data)) {
    return data.map((entry) => sortKeysDeep(entry));
  }

  if (data && typeof data === 'object' && data.constructor === Object) {
    const source = data as Record<string, unknown>;
    return Object.keys(source)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeysDeep(source[key]);
        return acc;
      }, {});
  }

  return data;
};

export const getSigningKeyType = (): IZsSignKeyType => activeKeyType;

export const signData = (data: object, privateKey: KeyObject, keyType: IZsSignKeyType): string => {
  const payload = Buffer.from(JSON.stringify(sortKeysDeep(data)));
  const algorithm = keyType === 'rsa' ? rsaSigningAlgorithm : null;
  return sign(algorithm, payload, privateKey).toString('base64');
};

export const verifyData = (data: object, signature: string, publicKey: KeyObject, keyType: IZsSignKeyType): boolean => {
  const payload = Buffer.from(JSON.stringify(sortKeysDeep(data)));
  const algorithm = keyType === 'rsa' ? rsaSigningAlgorithm : null;
  return verify(algorithm, payload, publicKey, Buffer.from(signature, 'base64'));
};

const getLocalIPv4 = (): string | undefined => {
  const bad = /^(lo|docker|veth|br-|virbr|vmnet|vboxnet|tun|tap|wg|zt)/;
  for (const [name, addrs] of Object.entries(networkInterfaces())) {
    if (bad.test(name)) continue;
    const ip = addrs?.find((a) => a.family === 'IPv4' && !a.internal)?.address;
    if (ip) return ip;
  }
  return undefined;
};

const getExternalIPv4 = async (): Promise<string | undefined> => {
  if (!env.SKIP_EXTERNAL_IP) {
    for (const url of [
      'https://ifconfig.me/ip',
      'https://api.ipify.org?format=text',
      'https://ifconfig.co/',
      'https://ipecho.net/plain',
    ]) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
        const externalIpResult = await res.text();
        if (externalIpResult.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
          return externalIpResult;
        }
      } catch {
        // ignore, try the next provider
      }
    }
  }
  return undefined;
};

export const getServerId = async (): Promise<string> => {
  const serverIP = getLocalIPv4();
  const externalIp = await getExternalIPv4();

  // DOMAIN/URL are deployment hints of the strapi setup and not part of `src/env.ts`
  let domain: string | undefined;
  try {
    if (process.env.DOMAIN) {
      domain = process.env.DOMAIN;
    } else if (process.env.URL) {
      domain = new URL(process.env.URL).host;
    }
  } catch {
    // ignore, an unparsable URL just drops the domain part
  }

  return (
    (domain ? domain + '-' : '') +
    (externalIp ? `ext:${externalIp}-` : '') +
    'host:' +
    hostname() +
    '-' +
    (serverIP || '0.0.0.0')
  );
};

/** `SIGN_PRIVATE_KEY_PASSPHRASE` is base64 and has to decode to at least 32 bytes. */
export const resolveSigningPassphrase = (): Buffer | null => {
  const configured = env.SIGN_PRIVATE_KEY_PASSPHRASE;
  if (!configured) return null;

  const passphrase = Buffer.from(configured, 'base64');
  if (passphrase.length < 32) {
    throw new Error(
      `SIGN_PRIVATE_KEY_PASSPHRASE: Invalid key length: ${passphrase.length}, expected >= 32 (after base64 decode)`,
    );
  }
  return passphrase;
};

export const createNewSigningKeyPair = (
  serverId: string,
  privateKeyPassphrase: Buffer | null,
  keyType: IZsSignKeyType = activeKeyType,
): NewSigningKeyPair => {
  const keyId = randomUUID();
  const passphrase = privateKeyPassphrase ? privateKeyPassphrase : randomBytes(32);

  // `modulusLength` only applies to rsa, ed25519 ignores it (kept for parity with the strapi util).
  // the rsa overload is the only one typed for der/der output, `passphrase` accepts a Buffer at runtime
  const { publicKey: publicKeyBuffer, privateKey: privateKeyBuffer } = generateKeyPairSync(keyType as 'rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'der',
      cipher: 'aes-256-cbc',
      passphrase: passphrase as unknown as string,
    },
  });

  // prepare keyObjects
  const privateKeyObject = createPrivateKey({
    key: privateKeyBuffer,
    format: 'der',
    type: 'pkcs8',
    passphrase,
  });

  const publicKeyObject = createPublicKey({
    key: publicKeyBuffer,
    format: 'der',
    type: 'spki',
  });

  return {
    config: { keyId, serverId, keyType, privateKeyObject, publicKeyObject },
    material: {
      keyId,
      serverId,
      keyType,
      // a temporary key pair (no passphrase configured) is never persisted in a usable form
      privateKeyEncrypted: privateKeyPassphrase ? privateKeyBuffer.toString('base64') : null,
      publicKey: publicKeyBuffer.toString('base64'),
      validFrom: new Date(),
      validUntil: null,
    },
  };
};

/** Recreates the key objects of a stored key pair and verifies them with a test signature. */
export const restoreSigningKeyPair = (
  serverId: string,
  storedKey: StoredSigningKey,
  privateKeyPassphrase: Buffer,
): SigningKeyConfig => {
  if (!storedKey.privateKeyEncrypted) {
    throw new Error(`signing keyId '${storedKey.keyId}' has no encrypted private key`);
  }

  const privateKeyObject = createPrivateKey({
    key: Buffer.from(storedKey.privateKeyEncrypted, 'base64'),
    format: 'der',
    type: 'pkcs8',
    passphrase: privateKeyPassphrase,
  });

  const publicKeyObject = createPublicKey({
    key: Buffer.from(storedKey.publicKey, 'base64'),
    format: 'der',
    type: 'spki',
  });

  //verify Keys:
  const testObject = { key: 'TestStringToSign', foo: 'bar' };
  const testSignature = signData(testObject, privateKeyObject, storedKey.keyType);
  if (!verifyData(testObject, testSignature, publicKeyObject, storedKey.keyType)) {
    throw new Error('KeyPair test failed, test signature cannot be verified');
  }

  return {
    keyId: storedKey.keyId,
    serverId,
    keyType: storedKey.keyType,
    privateKeyObject,
    publicKeyObject,
  };
};
