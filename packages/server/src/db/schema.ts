/**
 * Single drizzle schema barrel: everything drizzle-kit and drizzle-studio see.
 * Tables live next to the module that owns them (`src/modules/<feature>/schema.ts`).
 */
export * from '../modules/access/schema.js';
export * from '../modules/file/schema.js';
export * from '../modules/journal/schema.js';
export * from '../modules/map-layer-generation/schema.js';
export * from '../modules/map-layer/schema.js';
export * from '../modules/map-snapshot/schema.js';
export * from '../modules/operation/schema.js';
export * from '../modules/organization/schema.js';
export * from '../modules/signing-key/schema.js';
export * from '../modules/wms-source/schema.js';
export * from './auth-schema.js';
