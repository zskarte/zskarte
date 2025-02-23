import os from 'os';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { execSync } from 'child_process';

const destSubFolder = process.argv.length > 2 ? process.argv[2] : 'bundled';
let exec_name = process.argv.length > 3 ? process.argv[3] : 'strapi-app';

const platform = os.platform();
const arch = os.arch();
const lib = process.env.MUSL ? 'musl' : '';
const platformArch = `${platform}${lib}-${arch}`;

const serverDir = path.join('packages', 'server');
const bundleFilesDir = path.join(serverDir, 'bundle_files');
const destDir = path.join(serverDir, destSubFolder);
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}
fs.mkdirSync(destDir, { recursive: true });
console.log('destDir deleted and recreated');

try {
  const envSourcePath = path.join(bundleFilesDir, '.env.exec.example');
  const envTargetPath = path.join(destDir, '.env');
  fs.copyFileSync(envSourcePath, envTargetPath);
  console.log('env copied successfully');
} catch (error) {
  console.error('Error copying env:', error);
}

try {
  const seedSourcePath = path.join(bundleFilesDir, 'seed-config.json');
  const seedTargetPath = path.join(destDir, 'seed-config.json');
  fs.copyFileSync(seedSourcePath, seedTargetPath);
  console.log('seed config copied successfully');
} catch (error) {
  console.error('Error copying seed config:', error);
}

let startScript: string;
if (destSubFolder === 'bundled') {
  startScript = 'startWebpack';
} else {
  startScript = 'startServer';
}
if (platform === 'win32') {
  startScript = startScript + '.cmd';
} else {
  startScript = startScript + '.sh';
}

try {
  const startServerSourcePath = path.join(bundleFilesDir, startScript);
  const startServerTargetPath = path.join(destDir, startScript);
  fs.copyFileSync(startServerSourcePath, startServerTargetPath);
  console.log(`${startScript} copied successfully`);
} catch (error) {
  console.error(`Error copying ${startScript}:`, error);
}

if (destSubFolder !== 'bundled') {
  // Copy clean node executable
  function getNodePath(): string {
    const platform = os.platform();
    try {
      if (platform === 'win32') {
        // Windows
        return execSync('where node', { encoding: 'utf8' }).split('\r\n')[0];
      } else {
        // macOS and Linux
        return execSync('which node', { encoding: 'utf8' }).trim();
      }
      //return process.execPath;
    } catch (error) {
      console.error('Error finding Node.js executable:', error);
      return '';
    }
  }

  function removeSignature(executablePath: string): void {
    const platform = os.platform();
    try {
      if (platform === 'darwin') {
        // macOS
        console.log('Removing signature on macOS...');
        execSync(`codesign --remove-signature "${executablePath}"`, { stdio: 'inherit' });
      } else if (platform === 'win32') {
        // Windows (optional)
        console.log('Signature removal on Windows is optional and not implemented.');
      } else {
        console.log('Signature removal not required on this platform.');
      }
    } catch (error) {
      console.error('Error removing signature:', error);
    }
  }

  if (platform === 'win32') {
    exec_name = exec_name + '.exe';
  }
  const targetPath = path.join(destDir, exec_name);
  try {
    fs.copyFileSync(getNodePath(), targetPath);
  } catch (error) {
    console.error('Error copying node executable:', error);
  }
  removeSignature(targetPath);

  console.log('copy bundled .node files');
  glob('packages/server/bundled/*.node')
    .then((files) => {
      if (files.length === 0) {
        console.error(
          'No node files found, but there should be a node file for sharp, did you add node-loader to webpack config?',
        );
        return;
      }
      for (const sourceFile of files) {
        const targetFile = path.join(destDir, path.basename(sourceFile));
        console.log(`Copying ${sourceFile} to ${targetFile}`);
        fs.copyFileSync(sourceFile, targetFile);
      }
    })
    .catch((err) => {
      console.error('Error finding or copying .node file:', err);
    });
}

// Find and copy libvips file
(async () => {
  const libvipsPatterns = [
    'node_modules/**/sharp/build/Release/lib*',
    'node_modules/**/sharp/vendor/**/lib/lib*',
    path.join('node_modules', '@img', `sharp-libvips-${platformArch}`, 'lib', 'lib*'),
  ];

  let libvipsFound = false;
  for (const libvipsPattern of libvipsPatterns) {
    try {
      console.log(`Searching for libvips with pattern: ${libvipsPattern}`);
      const files = await glob(libvipsPattern);
      if (files.length > 0) {
        files.forEach((sourceFile) => {
          const targetFile = path.join(destDir, path.basename(sourceFile));
          console.log(`Copying ${sourceFile} to ${targetFile}`);
          fs.copyFileSync(sourceFile, targetFile);
        });
        console.log('libvips files copied successfully');
        libvipsFound = true;
        break;
      }
    } catch (err) {
      console.error('Error finding or copying libvips file:', err);
    }
  }
  if (!libvipsFound) {
    console.error('No matching libvips file found in any pattern.');
  }
})();
