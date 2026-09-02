import { createHash } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { basename, extname, isAbsolute, join, resolve } from 'node:path';
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { env } from '../../env.js';

export const uploadsDirectory = isAbsolute(env.STORAGE_LOCAL_DIR)
  ? env.STORAGE_LOCAL_DIR
  : resolve(process.cwd(), env.STORAGE_LOCAL_DIR);

export interface StorageSaveOptions {
  fileName: string;
  buffer: Buffer;
  mimeType: string;
}

export interface StoredFile {
  url: string;
  hash: string;
  ext: string;
  size: number;
  key: string;
}

export interface StorageProvider {
  readonly name: string;
  save(options: StorageSaveOptions): Promise<StoredFile>;
  replace(oldKeyOrUrl: string, options: StorageSaveOptions): Promise<StoredFile>;
  delete(keyOrUrl: string): Promise<void>;
  publicUrl(key: string): string;
}

export const getExtension = (fileName: string, mimeType?: string): string => {
  const ext = extname(fileName);
  if (ext) return ext.toLowerCase();
  if (mimeType) {
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
      case 'application/json':
      case 'application/geo+json':
        return '.json';
      case 'text/csv':
        return '.csv';
      case 'application/pdf':
        return '.pdf';
      default:
        return '';
    }
  }
  return '';
};

export class LocalStorageProvider implements StorageProvider {
  readonly name = 'local';
  private readonly targetDir: string;
  private readonly publicPrefix: string;

  constructor(targetDir: string = uploadsDirectory, publicPrefix = '/uploads/') {
    this.targetDir = targetDir;
    this.publicPrefix = publicPrefix.endsWith('/') ? publicPrefix : `${publicPrefix}/`;
  }

  async save(options: StorageSaveOptions): Promise<StoredFile> {
    const hash = createHash('sha256').update(options.buffer).digest('hex');
    const ext = getExtension(options.fileName, options.mimeType);
    const key = `${hash}${ext}`;
    const filePath = join(this.targetDir, key);

    await mkdir(this.targetDir, { recursive: true });
    await writeFile(filePath, options.buffer);

    const size = Number((options.buffer.length / 1024).toFixed(2));
    const url = this.publicUrl(key);

    return {
      url,
      hash,
      ext,
      size,
      key,
    };
  }

  async replace(oldKeyOrUrl: string, options: StorageSaveOptions): Promise<StoredFile> {
    const saved = await this.save(options);
    if (oldKeyOrUrl && oldKeyOrUrl !== saved.key && oldKeyOrUrl !== saved.url) {
      await this.delete(oldKeyOrUrl);
    }
    return saved;
  }

  async delete(keyOrUrl: string): Promise<void> {
    if (!keyOrUrl) return;
    const cleanKey = keyOrUrl.startsWith(this.publicPrefix)
      ? keyOrUrl.slice(this.publicPrefix.length)
      : basename(keyOrUrl);
    const filePath = join(this.targetDir, cleanKey);
    await rm(filePath, { force: true });
  }

  publicUrl(key: string): string {
    if (key.startsWith('http://') || key.startsWith('https://')) {
      return key;
    }
    if (key.startsWith(this.publicPrefix)) {
      return key;
    }
    const cleanKey = key.replace(/^\/+/, '');
    return `${this.publicPrefix}${cleanKey}`;
  }
}

export interface AzureBlobStorageOptions {
  account?: string;
  accountKey?: string;
  containerName?: string;
  serviceBaseUrl?: string;
  connectionString?: string;
}

export class AzureBlobStorageProvider implements StorageProvider {
  readonly name = 'azure';
  private readonly client: BlobServiceClient;
  private readonly containerName: string;

  constructor(options: AzureBlobStorageOptions = {}) {
    this.containerName = options.containerName || env.STORAGE_AZURE_CONTAINER_NAME || 'uploads';

    if (options.connectionString) {
      this.client = BlobServiceClient.fromConnectionString(options.connectionString);
    } else {
      const account = options.account || env.STORAGE_AZURE_ACCOUNT || '';
      const accountKey = options.accountKey || env.STORAGE_AZURE_ACCOUNT_KEY;
      const baseUrl = options.serviceBaseUrl || env.STORAGE_AZURE_SERVICE_BASE_URL;

      if (account && accountKey) {
        const credential = new StorageSharedKeyCredential(account, accountKey);
        const url = baseUrl || `https://${account}.blob.core.windows.net`;
        this.client = new BlobServiceClient(url, credential);
      } else if (baseUrl) {
        this.client = new BlobServiceClient(baseUrl);
      } else if (account) {
        this.client = new BlobServiceClient(`https://${account}.blob.core.windows.net`);
      } else {
        // Fallback or placeholder client (e.g. unit testing or dummy config)
        this.client = new BlobServiceClient('https://127.0.0.1:10000/devstoreaccount1');
      }
    }
  }

  private getContainerClient() {
    return this.client.getContainerClient(this.containerName);
  }

  private extractBlobName(keyOrUrl: string): string {
    if (keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://')) {
      try {
        const parsed = new URL(keyOrUrl);
        const segments = parsed.pathname.split('/').filter(Boolean);
        // If the path contains the container name as first segment, take the rest
        if (segments.length > 1 && segments[0] === this.containerName) {
          return segments.slice(1).join('/');
        }
        return segments[segments.length - 1] || keyOrUrl;
      } catch {
        return basename(keyOrUrl);
      }
    }
    return keyOrUrl.replace(/^\/+/, '');
  }

  async save(options: StorageSaveOptions): Promise<StoredFile> {
    const hash = createHash('sha256').update(options.buffer).digest('hex');
    const ext = getExtension(options.fileName, options.mimeType);
    const key = `${hash}${ext}`;

    const containerClient = this.getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(key);

    await blockBlobClient.uploadData(options.buffer, {
      blobHTTPHeaders: {
        blobContentType: options.mimeType,
      },
    });

    const size = Number((options.buffer.length / 1024).toFixed(2));
    const url = blockBlobClient.url;

    return {
      url,
      hash,
      ext,
      size,
      key,
    };
  }

  async replace(oldKeyOrUrl: string, options: StorageSaveOptions): Promise<StoredFile> {
    const saved = await this.save(options);
    if (oldKeyOrUrl && oldKeyOrUrl !== saved.key && oldKeyOrUrl !== saved.url) {
      await this.delete(oldKeyOrUrl);
    }
    return saved;
  }

  async delete(keyOrUrl: string): Promise<void> {
    if (!keyOrUrl) return;
    const blobName = this.extractBlobName(keyOrUrl);
    const blockBlobClient = this.getContainerClient().getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
  }

  publicUrl(key: string): string {
    if (key.startsWith('http://') || key.startsWith('https://')) {
      return key;
    }
    const blobName = this.extractBlobName(key);
    return this.getContainerClient().getBlockBlobClient(blobName).url;
  }
}

export const createStorageProvider = (
  providerType: 'local' | 'azure' = env.STORAGE_PROVIDER,
  options?: {
    localDir?: string;
    azure?: AzureBlobStorageOptions;
  },
): StorageProvider => {
  if (providerType === 'azure') {
    return new AzureBlobStorageProvider(options?.azure);
  }
  return new LocalStorageProvider(options?.localDir);
};

let activeStorageProvider: StorageProvider | null = null;

export const getStorageProvider = (): StorageProvider => {
  if (!activeStorageProvider) {
    activeStorageProvider = createStorageProvider();
  }
  return activeStorageProvider;
};

export const setStorageProvider = (provider: StorageProvider | null): void => {
  activeStorageProvider = provider;
};
