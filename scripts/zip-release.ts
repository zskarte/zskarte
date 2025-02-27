import os from 'os';
import AdmZip from 'adm-zip';

const platform = process.env.SEA_PLATFORM ?? os.platform();
const arch = process.env.SEA_ARCH ?? os.arch();
const lib = process.env.SEA_LIB ?? (process.env.MUSL ? 'musl' : '');
const platformArch = `${platform}${lib}-${arch}`;
const packageName = `zskarte-server-${platformArch}`
const zip = new (AdmZip as any)();

zip.addLocalFolder('./packages/server/exec', packageName);

zip.writeZip(`${packageName}.zip`);
console.log(`ZIP file ${packageName}.zip created successfully`);
