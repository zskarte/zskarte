#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = resolve(__dirname, '..');

const testFiles = [
  'test/permissions.test.ts',
  'test/auth-admin.test.ts',
  'test/admin-router.test.ts',
  'test/auth-procedures.test.ts',
];

console.log(`Running targeted permission/auth test suite (${testFiles.length} files)...`);
const startTime = Date.now();

const child = spawn(
  'npx',
  ['vitest', 'run', ...testFiles],
  {
    cwd: packageRoot,
    stdio: 'inherit',
    env: { ...process.env, CI: '1' },
  }
);

child.on('close', (code) => {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  if (code === 0) {
    console.log(`\n✓ All targeted permission & auth tests passed in ${elapsed}s!`);
    process.exit(0);
  } else {
    console.error(`\n✗ Test suite failed with exit code ${code} in ${elapsed}s.`);
    process.exit(code ?? 1);
  }
});
