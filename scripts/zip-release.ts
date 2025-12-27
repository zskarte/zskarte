import os from 'node:os';
import AdmZip from 'adm-zip';
import { familySync, MUSL } from 'detect-libc';

const exec_name =
  process.argv.length > 2
    ? process.argv[2]
    : process.env.npm_package_config_executableName
      ? process.env.npm_package_config_executableName
      : 'strapi-app';
const platform = process.env.SEA_PLATFORM ?? os.platform();
const arch = process.env.SEA_ARCH ?? os.arch();
const lib = (process.env.SEA_LIB ?? familySync() === MUSL) ? 'musl' : '';
const platformArch = `${platform}${lib}-${arch}`;
const packageName = `${exec_name}-${platformArch}`;
const zip = new (AdmZip as any)();

zip.addLocalFolder('./packages/server/exec', packageName);

zip.writeZip(`${packageName}.zip`);
console.log(`ZIP file ${packageName}.zip created successfully`);
