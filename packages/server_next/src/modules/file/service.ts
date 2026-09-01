import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, isAbsolute, join, resolve } from 'node:path';
import { TRPCError } from '@trpc/server';
import type { Database } from '../../db/client.js';
import { env } from '../../env.js';
import { type FileRow, files } from './schema.js';

export interface UploadFileInput {
  fileName: string;
  mimeType: string;
  base64: string;
  alternativeText?: string | null;
  caption?: string | null;
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

const getUploadsDirectory = (): string => {
  return isAbsolute(env.STORAGE_LOCAL_DIR) ? env.STORAGE_LOCAL_DIR : resolve(process.cwd(), env.STORAGE_LOCAL_DIR);
};

const getExtension = (fileName: string, mimeType: string): string => {
  const ext = extname(fileName);
  if (ext) return ext;
  switch (mimeType) {
    case 'image/png':
      return '.png';
    case 'image/jpeg':
    case 'image/jpg':
      return '.jpg';
    case 'image/svg+xml':
      return '.svg';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    default:
      return '';
  }
};

export const uploadFile = async (db: Database, input: UploadFileInput): Promise<FileRow> => {
  const cleanBase64 = input.base64.replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  const hash = createHash('sha256').update(buffer).digest('hex');
  const ext = getExtension(input.fileName, input.mimeType);
  const storedFileName = `${hash}${ext}`;

  if (env.STORAGE_PROVIDER === 'local') {
    const targetDir = getUploadsDirectory();
    await mkdir(targetDir, { recursive: true });
    await writeFile(join(targetDir, storedFileName), buffer);
  }

  const [row] = await db
    .insert(files)
    .values({
      name: input.fileName,
      alternativeText: input.alternativeText ?? null,
      caption: input.caption ?? null,
      hash,
      ext,
      mime: input.mimeType,
      size: Number((buffer.length / 1024).toFixed(2)),
      url: `/uploads/${storedFileName}`,
      provider: env.STORAGE_PROVIDER,
      folderPath: null,
      formats: null,
    })
    .returning();

  return row;
};
