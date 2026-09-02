import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { IZsStrapiAsset } from '@zskarte/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type UploadFileInput,
  deleteFile,
  extractBuffer,
  getFileById,
  replaceFile,
  uploadFile,
  validateBufferMimeType,
  validateLogoUpload,
} from '../src/modules/file/service.js';
import {
  AzureBlobStorageProvider,
  LocalStorageProvider,
  createStorageProvider,
  getExtension,
  getStorageProvider,
  setStorageProvider,
} from '../src/modules/file/storage.js';
import { logger } from '../src/lib/logger.js';
import { buildServer } from '../src/server.js';
import { createMockDb } from './helpers/index.js';

describe('getExtension', () => {
  it('extracts extension from filename if present', () => {
    expect(getExtension('test.PNG')).toBe('.png');
    expect(getExtension('archive.tar.gz')).toBe('.gz');
    expect(getExtension('style.json')).toBe('.json');
  });

  it('maps known mime types when filename has no extension', () => {
    expect(getExtension('image', 'image/png')).toBe('.png');
    expect(getExtension('image', 'image/jpeg')).toBe('.jpg');
    expect(getExtension('vector', 'image/svg+xml')).toBe('.svg');
    expect(getExtension('data', 'application/json')).toBe('.json');
    expect(getExtension('layer', 'application/geo+json')).toBe('.json');
    expect(getExtension('table', 'text/csv')).toBe('.csv');
  });

  it('returns empty string for unknown mime types and no extension', () => {
    expect(getExtension('unknown', 'application/octet-stream')).toBe('');
  });
});

describe('LocalStorageProvider', () => {
  let tempDir: string;
  let provider: LocalStorageProvider;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `zskarte-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await mkdir(tempDir, { recursive: true });
    provider = new LocalStorageProvider(tempDir, '/uploads/');
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('saves file to local disk with correct hash, ext, size, and url', async () => {
    const buffer = Buffer.from('hello world local storage');
    const result = await provider.save({
      fileName: 'hello.txt',
      buffer,
      mimeType: 'text/plain',
    });

    expect(result.url).toBe(`/uploads/${result.key}`);
    expect(result.ext).toBe('.txt');
    expect(result.size).toBe(Number((buffer.length / 1024).toFixed(2)));
    expect(result.hash).toBeDefined();

    const savedOnDisk = await readFile(join(tempDir, result.key), 'utf-8');
    expect(savedOnDisk).toBe('hello world local storage');
  });

  it('replaces an existing file and deletes the old one when content changes', async () => {
    const oldBuffer = Buffer.from('old content');
    const oldFile = await provider.save({
      fileName: 'file.txt',
      buffer: oldBuffer,
      mimeType: 'text/plain',
    });

    const newBuffer = Buffer.from('new updated content');
    const newFile = await provider.replace(oldFile.url, {
      fileName: 'file.txt',
      buffer: newBuffer,
      mimeType: 'text/plain',
    });

    expect(newFile.key).not.toBe(oldFile.key);
    expect(newFile.url).toBe(`/uploads/${newFile.key}`);

    // Old file should be deleted
    await expect(readFile(join(tempDir, oldFile.key))).rejects.toThrow();
    // New file exists
    const newContent = await readFile(join(tempDir, newFile.key), 'utf-8');
    expect(newContent).toBe('new updated content');
  });

  it('deletes a file by url or key', async () => {
    const buffer = Buffer.from('content to delete');
    const saved = await provider.save({
      fileName: 'delete-me.txt',
      buffer,
      mimeType: 'text/plain',
    });

    await provider.delete(saved.url);
    await expect(readFile(join(tempDir, saved.key))).rejects.toThrow();
  });

  it('formats public urls appropriately', () => {
    expect(provider.publicUrl('abc.png')).toBe('/uploads/abc.png');
    expect(provider.publicUrl('/uploads/abc.png')).toBe('/uploads/abc.png');
    expect(provider.publicUrl('https://example.com/image.png')).toBe('https://example.com/image.png');
  });
});

describe('AzureBlobStorageProvider', () => {
  it('creates instance and generates correct public urls', () => {
    const provider = new AzureBlobStorageProvider({
      account: 'testaccount',
      accountKey: 'testkey==',
      containerName: 'uploads',
      serviceBaseUrl: 'https://testaccount.blob.core.windows.net',
    });

    expect(provider.name).toBe('azure');
    expect(provider.publicUrl('test.png')).toBe('https://testaccount.blob.core.windows.net/uploads/test.png');
    expect(provider.publicUrl('https://custom-cdn.example.com/uploads/test.png')).toBe(
      'https://custom-cdn.example.com/uploads/test.png',
    );
  });

  it('saves, replaces, and deletes files using blob client', async () => {
    const provider = new AzureBlobStorageProvider({
      account: 'testaccount',
      accountKey: 'testkey==',
      containerName: 'uploads',
    });

    const mockUploadData = vi.fn().mockResolvedValue({});
    const mockDeleteIfExists = vi.fn().mockResolvedValue({ succeeded: true });

    (provider as any).getContainerClient = () => ({
      getBlockBlobClient: (blobName: string) => ({
        url: `https://testaccount.blob.core.windows.net/uploads/${blobName}`,
        uploadData: mockUploadData,
        deleteIfExists: mockDeleteIfExists,
      }),
    });

    const buffer = Buffer.from('azure blob content');
    const saved = await provider.save({
      fileName: 'test.png',
      mimeType: 'image/png',
      buffer,
    });

    expect(mockUploadData).toHaveBeenCalledWith(buffer, {
      blobHTTPHeaders: { blobContentType: 'image/png' },
    });
    expect(saved.url).toContain('https://testaccount.blob.core.windows.net/uploads/');
    expect(saved.ext).toBe('.png');

    // Replace
    const newBuffer = Buffer.from('new azure content');
    const replaced = await provider.replace(saved.url, {
      fileName: 'test.png',
      mimeType: 'image/png',
      buffer: newBuffer,
    });
    expect(mockDeleteIfExists).toHaveBeenCalled();
    expect(replaced.url).toBeDefined();

    // Delete
    await provider.delete(replaced.url);
    expect(mockDeleteIfExists).toHaveBeenCalledTimes(2);
  });
});

describe('Provider Factory', () => {
  afterEach(() => {
    setStorageProvider(null);
  });

  it('creates local provider by default', () => {
    const provider = createStorageProvider('local');
    expect(provider.name).toBe('local');
  });

  it('creates azure provider when requested', () => {
    const provider = createStorageProvider('azure', {
      azure: {
        account: 'dummy',
        accountKey: 'dummy==',
      },
    });
    expect(provider.name).toBe('azure');
  });

  it('allows overriding the global default provider with setStorageProvider', () => {
    const custom = new LocalStorageProvider('/custom/dir');
    setStorageProvider(custom);
    expect(getStorageProvider()).toBe(custom);
  });
});

describe('Logo and MIME validation', () => {
  it('validates allowed logo MIME types with correct extensions', () => {
    expect(() => validateLogoUpload({ fileName: 'logo.png', mimeType: 'image/png' })).not.toThrow();
    expect(() => validateLogoUpload({ fileName: 'logo.jpg', mimeType: 'image/jpeg' })).not.toThrow();
    expect(() => validateLogoUpload({ fileName: 'logo.jpeg', mimeType: 'image/jpeg' })).not.toThrow();
    expect(() => validateLogoUpload({ fileName: 'logo.svg', mimeType: 'image/svg+xml' })).not.toThrow();
    expect(() => validateLogoUpload({ fileName: 'logo.webp', mimeType: 'image/webp' })).not.toThrow();
  });

  it('rejects unsupported logo MIME types', () => {
    expect(() => validateLogoUpload({ fileName: 'doc.pdf', mimeType: 'application/pdf' })).toThrowError(
      /Logo MIME type is not supported/,
    );
  });

  it('rejects mismatched logo file extensions', () => {
    expect(() => validateLogoUpload({ fileName: 'logo.png', mimeType: 'image/jpeg' })).toThrowError(
      /Logo file extension does not match/,
    );
  });

  it('extracts buffer from base64 input or buffer input', () => {
    const buf = Buffer.from('test');
    expect(extractBuffer({ fileName: 'test.txt', mimeType: 'text/plain', buffer: buf })).toEqual(buf);

    const b64 = buf.toString('base64');
    expect(
      extractBuffer({ fileName: 'test.txt', mimeType: 'text/plain', base64: `data:text/plain;base64,${b64}` }),
    ).toEqual(buf);

    expect(() => extractBuffer({ fileName: 'test.txt', mimeType: 'text/plain' })).toThrowError(
      /File buffer or base64 data must be provided/,
    );
  });

  it('validates binary buffer MIME type against expected type', async () => {
    // Valid 1x1 PNG buffer
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );

    await expect(validateBufferMimeType(pngBuffer, 'image/png')).resolves.toBeUndefined();
    await expect(validateBufferMimeType(pngBuffer, 'image/jpeg')).rejects.toThrowError(/does not match/);
  });
});

describe('File Service & IZsStrapiAsset Parity', () => {
  let tempDir: string;
  let testStorage: LocalStorageProvider;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `zskarte-filesvc-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await mkdir(tempDir, { recursive: true });
    testStorage = new LocalStorageProvider(tempDir, '/uploads/');
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('uploadFile persists physical file and creates matching files row', async () => {
    const sampleBuffer = Buffer.from('file-content-for-upload');
    const fakeRow = {
      documentId: 'file-doc-123',
      name: 'sample.txt',
      alternativeText: 'Alt text',
      caption: 'Sample caption',
      width: null,
      height: null,
      formats: null,
      hash: 'fakehash',
      ext: '.txt',
      mime: 'text/plain',
      size: 0.02,
      url: '/uploads/fakehash.txt',
      previewUrl: null,
      provider: 'local',
      providerMetadata: null,
      folderPath: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { db, captured } = createMockDb({ returning: [[fakeRow]] });

    const input: UploadFileInput = {
      fileName: 'sample.txt',
      mimeType: 'text/plain',
      buffer: sampleBuffer,
      alternativeText: 'Alt text',
      caption: 'Sample caption',
    };

    const result = await uploadFile(db, input, testStorage);

    expect(captured.inserted).toHaveLength(1);
    const inserted = captured.inserted[0];
    expect(inserted.name).toBe('sample.txt');
    expect(inserted.mime).toBe('text/plain');
    expect(inserted.provider).toBe('local');
    expect(inserted.url).toContain('/uploads/');
    expect(inserted.size).toBe(Number((sampleBuffer.length / 1024).toFixed(2)));

    // Verify row shape satisfies IZsStrapiAsset requirements
    const strapiAsset: IZsStrapiAsset = {
      name: result.name,
      url: result.url,
      provider: result.provider,
      alternativeText: result.alternativeText ?? undefined,
      caption: result.caption ?? undefined,
      formats: result.formats ?? undefined,
      previewUrl: result.previewUrl ?? undefined,
    };
    expect(strapiAsset.name).toBe('sample.txt');
    expect(strapiAsset.url).toBe('/uploads/fakehash.txt');
    expect(strapiAsset.provider).toBe('local');
  });

  it('replaceFile replaces storage file and updates files table', async () => {
    const initialBuffer = Buffer.from('initial version');
    const initialSaved = await testStorage.save({
      fileName: 'version.txt',
      buffer: initialBuffer,
      mimeType: 'text/plain',
    });

    const existingRow = {
      documentId: 'file-100',
      name: 'version.txt',
      url: initialSaved.url,
      hash: initialSaved.hash,
      ext: initialSaved.ext,
      mime: 'text/plain',
      size: initialSaved.size,
      provider: 'local',
      alternativeText: null,
      caption: null,
      width: null,
      height: null,
      formats: null,
      previewUrl: null,
      providerMetadata: null,
      folderPath: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedBuffer = Buffer.from('second updated version');
    const updatedRow = {
      ...existingRow,
      name: 'version-v2.txt',
      size: 0.02,
    };

    const { db, captured } = createMockDb({
      selects: [[existingRow]],
      returning: [[updatedRow]],
    });

    const result = await replaceFile(
      db,
      'file-100',
      {
        fileName: 'version-v2.txt',
        mimeType: 'text/plain',
        buffer: updatedBuffer,
      },
      testStorage,
    );

    expect(result.name).toBe('version-v2.txt');
    expect(captured.updated).toHaveLength(1);
    expect(captured.updated[0]).toMatchObject({ name: 'version-v2.txt' });
  });

  it('replaceFile throws NOT_FOUND when file does not exist in db', async () => {
    const { db } = createMockDb({ selects: [[]] });

    await expect(
      replaceFile(
        db,
        'non-existent-id',
        {
          fileName: 'test.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('test'),
        },
        testStorage,
      ),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('deleteFile removes file from storage and database', async () => {
    const buffer = Buffer.from('to be deleted');
    const saved = await testStorage.save({
      fileName: 'delete.txt',
      buffer,
      mimeType: 'text/plain',
    });

    const existingRow = {
      documentId: 'file-del-1',
      url: saved.url,
    };

    const { db, captured } = createMockDb({
      selects: [[existingRow]],
      returning: [[]],
    });

    await deleteFile(db, 'file-del-1', testStorage);

    expect(captured.deleted).toHaveLength(1);
    await expect(readFile(join(tempDir, saved.key))).rejects.toThrow();
  });

  it('getFileById returns the matching file row', async () => {
    const existingRow = {
      documentId: 'file-abc',
      name: 'logo.png',
      url: '/uploads/logo.png',
    };

    const { db } = createMockDb({ selects: [[existingRow]] });

    const file = await getFileById(db, 'file-abc');
    expect(file).toEqual(existingRow);
  });
});

describe('Static File Serving via Fastify', () => {
  it('serves static files from uploads directory', async () => {
    const prevLevel = logger.level;
    logger.level = 'silent';
    const app = await buildServer();
    const testFileName = `test-static-${Date.now()}.txt`;
    const uploadsDir = (await import('../src/server.js')).uploadsDirectory;

    await mkdir(uploadsDir, { recursive: true });
    await writeFile(join(uploadsDir, testFileName), 'static file content from fastify');

    try {
      const response = await app.inject({
        method: 'GET',
        url: `/uploads/${testFileName}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe('static file content from fastify');
    } finally {
      await rm(join(uploadsDir, testFileName), { force: true });
      await app.close();
      logger.level = prevLevel;
    }
  });
});
