import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import type { SigningKeyMaterial } from '../../lib/signing.js';
import { type SigningKeyRow, signingKeys } from './schema.js';

/**
 * Signing keys belong to the server, not to an organization, so these queries take no tenant scope.
 * The `publicColumns` projection is the only one reachable from a router, `privateKeyEncrypted`
 * cannot be part of a client visible object by construction.
 */
const publicColumns = {
  keyId: signingKeys.keyId,
  serverId: signingKeys.serverId,
  keyType: signingKeys.keyType,
  publicKey: signingKeys.publicKey,
  validFrom: signingKeys.validFrom,
  validUntil: signingKeys.validUntil,
};

const serverColumns = {
  documentId: signingKeys.documentId,
  keyId: signingKeys.keyId,
  keyType: signingKeys.keyType,
  publicKey: signingKeys.publicKey,
  privateKeyEncrypted: signingKeys.privateKeyEncrypted,
};

export type PublicSigningKey = Pick<SigningKeyRow, keyof typeof publicColumns>;

export type ServerSigningKey = Pick<SigningKeyRow, keyof typeof serverColumns>;

export const findPublicByKeyId = async (db: Database, keyId: string): Promise<PublicSigningKey | null> => {
  const [row] = await db.select(publicColumns).from(signingKeys).where(eq(signingKeys.keyId, keyId)).limit(1);
  return row ?? null;
};

/** Server side lookup of the still valid, decryptable key pair of this server. */
export const findValidForServer = async (
  db: Database,
  serverId: string,
  keyType: ServerSigningKey['keyType'],
): Promise<ServerSigningKey | null> => {
  const [row] = await db
    .select(serverColumns)
    .from(signingKeys)
    .where(
      and(
        eq(signingKeys.serverId, serverId),
        eq(signingKeys.keyType, keyType),
        isNotNull(signingKeys.privateKeyEncrypted),
        isNull(signingKeys.validUntil),
      ),
    )
    .limit(1);
  return row ?? null;
};

export const invalidateByDocumentId = async (db: Database, documentId: string, validUntil: Date): Promise<void> => {
  await db.update(signingKeys).set({ validUntil }).where(eq(signingKeys.documentId, documentId));
};

export const invalidateValidForServer = async (db: Database, serverId: string, validUntil: Date): Promise<void> => {
  await db
    .update(signingKeys)
    .set({ validUntil })
    .where(and(eq(signingKeys.serverId, serverId), isNull(signingKeys.validUntil)));
};

export const insertSigningKey = async (db: Database, material: SigningKeyMaterial): Promise<void> => {
  await db.insert(signingKeys).values(material);
};
