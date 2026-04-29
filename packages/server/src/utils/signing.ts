import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { Core } from '@strapi/strapi';
import os from 'os';
import { IZsSignKeyType } from '@zskarte/types';
import { sortKeysDeep } from '@zskarte/common';

const rsaSigningAlgorithm = 'RSA-SHA256';
const activeKeyType: IZsSignKeyType = process.env.SIGN_KEY_TYPE === 'rsa' ? 'rsa' : 'ed25519';

export interface SigningKeyConfig {
  keyId: string;
  serverId: string;
  keyType: IZsSignKeyType;
  privateKeyObject: crypto.KeyObject;
  publicKeyObject: crypto.KeyObject;
}

function getLocalIPv4() {
  const bad = /^(lo|docker|veth|br-|virbr|vmnet|vboxnet|tun|tap|wg|zt)/;
  for (const [name, addrs] of Object.entries(os.networkInterfaces())) {
    if (bad.test(name)) continue;
    const ip = addrs?.find((a) => a.family === 'IPv4' && !a.internal)?.address;
    if (ip) return ip;
  }
}

async function getExternalIPv4() {
  if (process.env.SKIP_EXTERNAL_IP !== 'true') {
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
      } catch (ignoreMe) {}
    }
  }
}

export async function getServerId() {
  const serverIP = getLocalIPv4();
  const externalIp = await getExternalIPv4();

  let domain: string;
  try {
    if (process.env.DOMAIN) {
      domain = process.env.DOMAIN;
    } else if (process.env.URL) {
      domain = new URL(process.env.URL).host;
    }
  } catch (ignoreMe) {}

  return (
    (domain ? domain + '-' : '') +
    (externalIp ? `ext:${externalIp}-` : '') +
    'host:' +
    os.hostname() +
    '-' +
    (serverIP || '0.0.0.0')
  );
}

export function createNewSigningKeyPair(
  serverId: string,
  privateKeyPassphrase: Buffer,
  strapi: Core.Strapi,
  keyType: IZsSignKeyType = activeKeyType,
): SigningKeyConfig {
  const keyId = uuidv4();
  const passphrase = privateKeyPassphrase ? privateKeyPassphrase : crypto.randomBytes(32);

  const { publicKey: publicKeyBuffer, privateKey: privateKeyBuffer } = crypto.generateKeyPairSync(keyType as any, {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der', cipher: 'aes-256-cbc', passphrase },
  });

  // prepare keyObjects
  const privateKeyObject = crypto.createPrivateKey({
    key: privateKeyBuffer,
    format: 'der',
    type: 'pkcs8',
    passphrase,
  });

  const publicKeyObject = crypto.createPublicKey({
    key: publicKeyBuffer,
    format: 'der',
    type: 'spki',
  });

  const privateKeyEncrypted = privateKeyPassphrase ? privateKeyBuffer.toString('base64') : null;
  const publicKey = publicKeyBuffer.toString('base64');
  const signingKey = {
    keyId,
    serverId,
    privateKeyEncrypted,
    keyType,
    publicKey,
    validFrom: new Date(),
    validUntil: null,
  };
  strapi.documents('api::signing-key.signing-key').create({ data: signingKey });

  if (privateKeyPassphrase) {
    strapi.log.warn(`create new signing keyPair: serverId '${serverId}', keyId '${keyId}', keyType '${keyType}'`);
  } else {
    strapi.log.warn(
      `create new temporary(no env.SIGN_PRIVATE_KEY_PASSPHRASE defined) signing keyPair: serverId '${serverId}', keyId '${keyId}', keyType '${keyType}'`,
    );
  }

  return {
    keyId,
    serverId,
    keyType,
    privateKeyObject,
    publicKeyObject,
  };
}

export async function getOrCreateSigningKeyPair(
  serverId: string,
  privateKeyPassphrase: Buffer,
  strapi: Core.Strapi,
  keyType: IZsSignKeyType = activeKeyType,
): Promise<SigningKeyConfig> {
  if (privateKeyPassphrase) {
    //try to read valid key and decrypt
    const signingKey = await strapi.documents('api::signing-key.signing-key').findFirst({
      filters: { serverId: serverId, keyType: keyType, privateKeyEncrypted: { $ne: null }, validUntil: { $eq: null } },
    });
    if (signingKey) {
      try {
        const privateKeyString = signingKey.privateKeyEncrypted;

        //recreate keyObjects
        const privateKeyObject = crypto.createPrivateKey({
          key: Buffer.from(privateKeyString, 'base64'),
          format: 'der',
          type: 'pkcs8',
          passphrase: privateKeyPassphrase,
        });

        const publicKeyObject = crypto.createPublicKey({
          key: Buffer.from(signingKey.publicKey, 'base64'),
          format: 'der',
          type: 'spki',
        });

        //verify Keys:
        const testObject = { key: 'TestStringToSign', foo: 'bar' };
        const testSignature = signData(testObject, privateKeyObject, keyType);
        if (!verifyData(testObject, testSignature, publicKeyObject, keyType)) {
          throw 'KeyPair test failed, test signature cannot be verified';
        }

        return {
          keyId: signingKey.keyId,
          serverId,
          keyType,
          privateKeyObject,
          publicKeyObject,
        };
      } catch (error) {
        strapi.log.error(
          `cannot decrypt private signing keyId '${signingKey.keyId}', invalidate key pair. Error was :` + error,
        );
        strapi.documents('api::signing-key.signing-key').update({
          documentId: signingKey.documentId,
          data: {
            validUntil: new Date(),
          },
        });
      }
    }
  }
  //invalidate all existing keys for serverId
  const signingKeys = await strapi.documents('api::signing-key.signing-key').findMany({
    filters: { serverId: serverId, validUntil: { $eq: null } },
  });
  signingKeys.forEach((signingKey) => {
    strapi.documents('api::signing-key.signing-key').update({
      documentId: signingKey.documentId,
      data: {
        validUntil: new Date(),
      },
    });
  });
  return createNewSigningKeyPair(serverId, privateKeyPassphrase, strapi, keyType);
}

export function signData(data: object, privateKey: crypto.KeyObject, keyType: IZsSignKeyType) {
  const payload = Buffer.from(JSON.stringify(sortKeysDeep(data)));
  const algorithm = keyType === 'rsa' ? rsaSigningAlgorithm : null;
  return crypto.sign(algorithm, payload, privateKey).toString('base64');
}

export function verifyData(data: object, signature: string, publicKey: crypto.KeyObject, keyType: IZsSignKeyType) {
  const payload = Buffer.from(JSON.stringify(sortKeysDeep(data)));
  const algorithm = keyType === 'rsa' ? rsaSigningAlgorithm : null;
  return crypto.verify(algorithm, payload, publicKey, Buffer.from(signature, 'base64'));
}
