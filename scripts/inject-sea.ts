import { execSync } from 'child_process';
import os from 'os';

let nodeExecToInjectTo = process.argv[2];
if (os.platform() === "win32") {
	nodeExecToInjectTo = nodeExecToInjectTo + '.exe';
}
const seaBlob = process.argv[3];
if (os.platform() === "darwin") {
	execSync(`npx postject ${nodeExecToInjectTo} NODE_SEA_BLOB ${seaBlob} --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 --macho-segment-name NODE_SEA`, { encoding: 'utf8' })
	execSync(`codesign --sign - ${nodeExecToInjectTo}`);
} else {
	execSync(`npx postject ${nodeExecToInjectTo} NODE_SEA_BLOB ${seaBlob} --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`, { encoding: 'utf8' })
}
