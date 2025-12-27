import { execSync } from 'node:child_process';
import os from 'node:os';

let seaBlob: string;
if (process.argv.length < 4) {
  seaBlob = 'strapi-app.blob';
} else {
  seaBlob = process.argv[3];
}

let nodeExecToInjectTo: string;
if (process.argv.length < 3) {
  if (process.env.npm_package_config_executableName) {
    nodeExecToInjectTo = `packages/server/exec/${process.env.npm_package_config_executableName}`;
  } else {
    nodeExecToInjectTo = 'packages/server/exec/strapi-app';
  }
} else {
  nodeExecToInjectTo = process.argv[2];
}
if (os.platform() === 'win32') {
  nodeExecToInjectTo = `${nodeExecToInjectTo}.exe`;
}

if (os.platform() === 'darwin') {
  execSync(
    `npx postject ${nodeExecToInjectTo} NODE_SEA_BLOB ${seaBlob} --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 --macho-segment-name NODE_SEA`,
    { encoding: 'utf8' },
  );
  execSync(`codesign --sign - ${nodeExecToInjectTo}`);
} else {
  execSync(
    `npx postject ${nodeExecToInjectTo} NODE_SEA_BLOB ${seaBlob} --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`,
    { encoding: 'utf8' },
  );
}
