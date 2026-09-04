import { pathToFileURL } from 'node:url';
import { closeDatabase, db } from '../../db/client.js';
import { logger } from '../../lib/logger.js';
import { seedDefaultStyleAssets, updateMapLayerMedias } from './service.js';

export interface CliOptions {
  force?: boolean;
  cantons?: string[];
  date?: Date;
  seedStylesOnly?: boolean;
  help?: boolean;
}

export function parseCliArgs(args: string[]): CliOptions {
  const options: CliOptions = {};

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--force' || arg === '-f') {
      options.force = true;
    } else if (arg === '--seed-styles-only') {
      options.seedStylesOnly = true;
    } else if (arg.startsWith('--cantons=')) {
      const cantonsStr = arg.slice('--cantons='.length);
      options.cantons = cantonsStr
        .split(',')
        .map((c) => c.trim().toUpperCase())
        .filter((c) => c.length > 0);
    } else if (arg.startsWith('--date=')) {
      const dateStr = arg.slice('--date='.length);
      const parsedDate = new Date(dateStr);
      if (!Number.isNaN(parsedDate.getTime())) {
        options.date = parsedDate;
      } else {
        throw new Error(`Invalid date format provided in --date: ${dateStr}`);
      }
    }
  }

  return options;
}

export function printHelp(): void {
  console.log(`
Map Layer Generation CLI

Usage:
  npm run maplayer:generate [options]

Options:
  --force, -f           Force generation even if disabled in config
  --cantons=C1,C2,...   Generate only specified cantons (comma-separated, e.g. --cantons=BE,ZH)
  --date=YYYY-MM-DD     Reference date for archive period fallback calculations
  --seed-styles-only    Seed bundled map styles from packages/server/init/*.json without generating layers
  --help, -h            Show this help message
`);
}

export async function runCli(args: string[] = process.argv.slice(2)): Promise<void> {
  const options = parseCliArgs(args);

  if (options.help) {
    printHelp();
    return;
  }

  logger.info({ options }, 'Starting map layer generation CLI command');

  if (options.seedStylesOnly) {
    logger.info('Seeding default style assets...');
    const result = await seedDefaultStyleAssets(db, { logger });
    logger.info(
      { seededCount: result.seeded.length, configId: result.config.documentId },
      'Default style assets seeded successfully',
    );
    return;
  }

  const result = await updateMapLayerMedias(db, {
    force: options.force,
    cantons: options.cantons,
    now: options.date,
    logger,
  });

  logger.info(
    {
      startedAt: result.startedAt,
      endedAt: result.endedAt,
      durationMs: result.endedAt.getTime() - result.startedAt.getTime(),
    },
    'Map layer generation finished successfully',
  );
}

const isMain = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isMain) {
  runCli()
    .then(async () => {
      await closeDatabase().catch(() => undefined);
      process.exit(0);
    })
    .catch(async (error) => {
      logger.error({ err: error }, 'Map layer generation CLI execution failed');
      await closeDatabase().catch(() => undefined);
      process.exit(1);
    });
}
