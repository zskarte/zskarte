import { randomBytes } from 'node:crypto';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Stable, public facing entity id. Mirrors the format of the Strapi `documentId`
 * the angular app uses as primary handle (24 lowercase alphanumeric characters).
 */
export const createDocumentId = (size = 24): string => {
  const bytes = randomBytes(size);
  let id = '';
  for (let i = 0; i < size; i++) {
    id += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return id;
};
