import type { IZsSignKeyType } from '@zskarte/types';
import type { Database } from '../../db/client.js';
import type { Logger } from '../../lib/logger.js';
import {
  type SigningKeyConfig,
  createNewSigningKeyPair,
  getServerId,
  getSigningKeyType,
  resolveSigningPassphrase,
  restoreSigningKeyPair,
} from '../../lib/signing.js';
import {
  type PublicSigningKey,
  findPublicByKeyId,
  findValidForServer,
  insertSigningKey,
  invalidateByDocumentId,
  invalidateValidForServer,
} from './repository.js';

export interface SigningKeyDeps {
  db: Database;
  logger: Logger;
}

let activeConfig: SigningKeyConfig | undefined;

/** Public key material of a key id, `null` for an unknown key (the strapi route answered `data: null`). */
export const getPublicSigningKey = async (db: Database, keyId: string): Promise<PublicSigningKey | null> =>
  findPublicByKeyId(db, keyId);

const persistNewKeyPair = async (
  { db, logger }: SigningKeyDeps,
  serverId: string,
  passphrase: Buffer | null,
  keyType: IZsSignKeyType,
): Promise<SigningKeyConfig> => {
  const { config, material } = createNewSigningKeyPair(serverId, passphrase, keyType);
  await insertSigningKey(db, material);

  if (passphrase) {
    logger.warn(`create new signing keyPair: serverId '${serverId}', keyId '${config.keyId}', keyType '${keyType}'`);
  } else {
    logger.warn(
      `create new temporary(no env.SIGN_PRIVATE_KEY_PASSPHRASE defined) signing keyPair: serverId '${serverId}', keyId '${config.keyId}', keyType '${keyType}'`,
    );
  }

  return config;
};

export const getOrCreateSigningKeyPair = async (
  deps: SigningKeyDeps,
  serverId: string,
  passphrase: Buffer | null,
  keyType: IZsSignKeyType = getSigningKeyType(),
): Promise<SigningKeyConfig> => {
  const { db, logger } = deps;

  if (passphrase) {
    //try to read valid key and decrypt
    const storedKey = await findValidForServer(db, serverId, keyType);
    if (storedKey) {
      try {
        return restoreSigningKeyPair(serverId, storedKey, passphrase);
      } catch (error) {
        logger.error(
          `cannot decrypt private signing keyId '${storedKey.keyId}', invalidate key pair. Error was :` + error,
        );
        await invalidateByDocumentId(db, storedKey.documentId, new Date());
      }
    }
  }

  //invalidate all existing keys for serverId
  await invalidateValidForServer(db, serverId, new Date());
  return persistNewKeyPair(deps, serverId, passphrase, keyType);
};

/**
 * Boot entry point of the signing subsystem. Not wired into `src/index.ts` yet, the changeset
 * signing step of the migration attaches it.
 */
export const initializeSigningKeys = async (deps: SigningKeyDeps): Promise<SigningKeyConfig> => {
  const passphrase = resolveSigningPassphrase();
  const serverId = await getServerId();
  activeConfig = await getOrCreateSigningKeyPair(deps, serverId, passphrase);
  deps.logger.info(`signing serverId: ${serverId}, keyId: ${activeConfig.keyId}, keyType: ${activeConfig.keyType}`);
  return activeConfig;
};

/** Key pair used to sign changesets, `undefined` until `initializeSigningKeys` ran. */
export const getActiveSigningKeyConfig = (): SigningKeyConfig | undefined => activeConfig;
