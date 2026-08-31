import { existsSync, symlinkSync } from 'fs';
import path from 'path';

/**
 * The strapi package pins react 18 and typescript 5.4, which makes npm nest some
 * dependencies of packages/server_next instead of hoisting them. drizzle-kit resolves
 * `drizzle-orm` relative to its own (hoisted) location and fails otherwise, so we link
 * the nested copy into the root node_modules. Can be dropped together with packages/server.
 */
const packagesToLink = ['drizzle-orm'];

for (const name of packagesToLink) {
  const target = path.resolve('packages/server_next/node_modules', name);
  const link = path.resolve('node_modules', name);

  if (existsSync(link) || !existsSync(target)) {
    continue;
  }

  symlinkSync(target, link);
  console.log(`linked ${name} into the root node_modules for drizzle-kit`);
}
