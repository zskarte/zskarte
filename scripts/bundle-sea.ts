import { execSync } from 'node:child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const packageJsonPath = join(process.cwd(), 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const moduleType = packageJson.type; // "module" or "commonjs" or undefined

let seaConfigFile: string;
if (moduleType === 'module') {
  //Node Simple Execution Application(SEA) is currently not able to direct run an ESModule js entrypoint, so have to use a wrapper script.
  seaConfigFile = 'sea-config_esm.json';
} else {
  seaConfigFile = 'sea-config.json';
}

execSync(`node --experimental-sea-config packages/server/bundle_files/${seaConfigFile}`, { encoding: 'utf8' });
