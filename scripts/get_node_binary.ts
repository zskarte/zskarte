import fs from 'fs';
import path from 'path';
import https from 'https';
import AdmZip from 'adm-zip';
import { execSync } from 'child_process';

export type Arch = 'arm64' | 'x64';
export type Lib = 'glibc' | 'musl' | '';
export type Platform = 'win32' | 'linux' | 'darwin';

interface DownloadOptions {
  version: string;
  arch: Arch;
  lib: Lib;
  platform: Platform;
  destFile: string;
}

function validateInput(options: DownloadOptions): void {
  if (!['arm64', 'x64'].includes(options.arch)) {
    throw new Error(`Architecture must be 'arm64' or 'x64' but is '${options.arch}'`);
  }

  if (!['win32', 'linux', 'darwin'].includes(options.platform)) {
    throw new Error(`OS must be 'win32', 'linux', or 'darwin' but is '${options.platform}'`);
  }

  if (options.platform === 'linux' && !['glibc', 'musl'].includes(options.lib)) {
    if (!options.lib) {
      options.lib = 'glibc';
    } else {
      throw new Error(`C library must be 'glibc' or 'musl' for Linux but is ${options.lib}`);
    }
  } else if (options.platform !== 'linux' && options.lib) {
    throw new Error(`C library must be '' for Windows and macOS but is ${options.lib}`);
  }
}

function getPlatform(options: DownloadOptions): string {
  switch (options.platform) {
    case 'win32':
      return options.arch === 'x64' ? 'win-x64' : 'win-x86';
    case 'linux':
      if (options.arch === 'x64' && options.lib === 'glibc') return 'linux-x64';
      if (options.arch === 'x64' && options.lib === 'musl') return 'linux-x64-musl';
      if (options.arch === 'arm64' && options.lib === 'glibc') return 'linux-armv7l';
      throw new Error('ARM with musl is not officially supported');
    case 'darwin':
      return options.arch === 'x64' ? 'darwin-x64' : 'darwin-arm64';
  }
}

function getFileExtension(os: Platform): string {
  switch (os) {
    case 'win32':
      return 'zip';
    case 'linux':
      return 'tar.xz';
    case 'darwin':
      return 'tar.gz';
  }
}

async function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }

        const fileStream = fs.createWriteStream(destPath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      })
      .on('error', reject);
  });
}

async function extractArchive(filePath: string, destPath: string, os: Platform): Promise<void> {
  if (os === 'win32') {
    const zip = new (AdmZip as any)(filePath);
    zip.extractAllTo(destPath, true);
  } else {
    execSync(`tar -xf ${filePath} -C ${destPath}`);
    //await tar.x({ file: filePath, cwd: destPath });
  }
}

export async function downloadAndExtractNode(options: DownloadOptions): Promise<void> {
  validateInput(options);

  const platform = getPlatform(options);
  const fileExt = getFileExtension(options.platform);
  const isMusl = options.platform === 'linux' && options.lib === 'musl';
  const baseUrl = isMusl ? 'https://unofficial-builds.nodejs.org/download/release' : 'https://nodejs.org/dist';
  const url = `${baseUrl}/v${options.version}/node-v${options.version}-${platform}.${fileExt}`;

  console.log(`Downloading Node.js v${options.version} for ${platform}...`);

  const tempDir = fs.mkdtempSync('node-download-');
  const archivePath = path.join(tempDir, `node-package.${fileExt}`);

  try {
    await downloadFile(url, archivePath);
    await extractArchive(archivePath, tempDir, options.platform);

    const extractedDir = path.join(tempDir, `node-v${options.version}-${platform}`);
    const nodeBinary =
      options.platform === 'win32' ? path.join(extractedDir, 'node.exe') : path.join(extractedDir, 'bin', 'node');
    fs.copyFileSync(nodeBinary, options.destFile);

    console.log(`Node.js executable for ${platform} has been downloaded and extracted to ${options.destFile}.`);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}
