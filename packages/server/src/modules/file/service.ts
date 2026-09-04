import { extname } from 'node:path';
import { TRPCError } from '@trpc/server';
import type { UZsStrapiAssetFormat } from '@zskarte/types';
import { eq } from 'drizzle-orm';
import { fileTypeFromBuffer } from 'file-type';
import type { Database } from '../../db/client.js';
import { type FileRow, files } from './schema.js';
import { getStorageProvider, type StorageProvider } from './storage.js';

export interface UploadFileInput {
  fileName: string;
  mimeType: string;
  base64?: string;
  buffer?: Buffer;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  formats?: Record<string, UZsStrapiAssetFormat> | null;
  previewUrl?: string | null;
  providerMetadata?: Record<string, unknown> | null;
  folderPath?: string | null;
}

export const ALLOWED_LOGO_MIME_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'] as const;

type LogoMimeType = (typeof ALLOWED_LOGO_MIME_TYPES)[number];

const LOGO_EXTENSIONS: Record<LogoMimeType, readonly string[]> = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/svg+xml': ['.svg'],
  'image/webp': ['.webp'],
};

export const validateLogoUpload = (input: Pick<UploadFileInput, 'fileName' | 'mimeType'>): void => {
  if (!(ALLOWED_LOGO_MIME_TYPES as readonly string[]).includes(input.mimeType)) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Logo MIME type is not supported.' });
  }

  const extension = extname(input.fileName).toLowerCase();
  const allowedExtensions = LOGO_EXTENSIONS[input.mimeType as LogoMimeType];
  if (extension && !allowedExtensions.includes(extension)) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Logo file extension does not match its MIME type.' });
  }
};

export const extractBuffer = (input: UploadFileInput): Buffer => {
  if (input.buffer) {
    return input.buffer;
  }
  if (input.base64) {
    const cleanBase64 = input.base64.replace(/^data:[^;]+;base64,/, '');
    return Buffer.from(cleanBase64, 'base64');
  }
  throw new TRPCError({ code: 'BAD_REQUEST', message: 'File buffer or base64 data must be provided.' });
};

export const validateBufferMimeType = async (buffer: Buffer, expectedMimeType: string): Promise<void> => {
  const detected = await fileTypeFromBuffer(buffer);
  if (detected && detected.mime !== expectedMimeType) {
    // Some formats like image/jpeg vs image/jpg can have minor variations
    if (!(expectedMimeType.startsWith('image/jp') && detected.mime.startsWith('image/jp'))) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `File content (${detected.mime}) does not match specified MIME type (${expectedMimeType}).`,
      });
    }
  }
};

export const uploadFile = async (
  db: Database,
  input: UploadFileInput,
  storageProvider?: StorageProvider,
): Promise<FileRow> => {
  const buffer = extractBuffer(input);
  const provider = storageProvider ?? getStorageProvider();

  const stored = await provider.save({
    fileName: input.fileName,
    buffer,
    mimeType: input.mimeType,
  });

  const [row] = await db
    .insert(files)
    .values({
      name: input.fileName,
      alternativeText: input.alternativeText ?? null,
      caption: input.caption ?? null,
      width: input.width ?? null,
      height: input.height ?? null,
      formats: input.formats ?? null,
      hash: stored.hash,
      ext: stored.ext,
      mime: input.mimeType,
      size: stored.size,
      url: stored.url,
      previewUrl: input.previewUrl ?? null,
      provider: provider.name,
      providerMetadata: input.providerMetadata ?? null,
      folderPath: input.folderPath ?? null,
    })
    .returning();

  return row;
};

export const replaceFile = async (
  db: Database,
  documentId: string,
  input: UploadFileInput,
  storageProvider?: StorageProvider,
): Promise<FileRow> => {
  const [existing] = await db.select().from(files).where(eq(files.documentId, documentId)).limit(1);
  if (!existing) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'File not found.' });
  }

  const buffer = extractBuffer(input);
  const provider = storageProvider ?? getStorageProvider();

  const stored = await provider.replace(existing.url, {
    fileName: input.fileName,
    buffer,
    mimeType: input.mimeType,
  });

  const [row] = await db
    .update(files)
    .set({
      name: input.fileName,
      alternativeText: input.alternativeText !== undefined ? input.alternativeText : existing.alternativeText,
      caption: input.caption !== undefined ? input.caption : existing.caption,
      width: input.width !== undefined ? input.width : existing.width,
      height: input.height !== undefined ? input.height : existing.height,
      formats: input.formats !== undefined ? input.formats : existing.formats,
      hash: stored.hash,
      ext: stored.ext,
      mime: input.mimeType,
      size: stored.size,
      url: stored.url,
      previewUrl: input.previewUrl !== undefined ? input.previewUrl : existing.previewUrl,
      provider: provider.name,
      providerMetadata: input.providerMetadata !== undefined ? input.providerMetadata : existing.providerMetadata,
      folderPath: input.folderPath !== undefined ? input.folderPath : existing.folderPath,
    })
    .where(eq(files.documentId, documentId))
    .returning();

  return row;
};

export const deleteFile = async (
  db: Database,
  documentId: string,
  storageProvider?: StorageProvider,
): Promise<void> => {
  const [existing] = await db.select().from(files).where(eq(files.documentId, documentId)).limit(1);
  if (!existing) {
    return;
  }

  const provider = storageProvider ?? getStorageProvider();
  await provider.delete(existing.url);
  await db.delete(files).where(eq(files.documentId, documentId));
};

export const getFileById = async (db: Database, documentId: string): Promise<FileRow | null> => {
  const [file] = await db.select().from(files).where(eq(files.documentId, documentId)).limit(1);
  return file ?? null;
};
