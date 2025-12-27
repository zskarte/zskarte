//prevent to show Buffer warning from iconv-lite <- libmime <- mailcomposer <- sendmail <- @strapi/provider-email-sendmail <- @strapi/email (except the strapi ones all modules are very old...)
//@ts-ignore
process.noDeprecation = true;

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createStrapi, type Core } from '@strapi/strapi';
import { loadEnvFile, updateEnvFile, program_dir } from './utils/envManager.js';
import { importConfigSync, importSeedConfigFile } from './utils/setup.js';
import lifecycles from './index.js';

//create missing secrets
updateEnvFile();

loadEnvFile();
const uploadDir = path.join(program_dir, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('uploadDir created');
}

async function setup(strapi: Core.Strapi) {
  console.log('Perform system setup...');
  await strapi.start();
  await importConfigSync();
  await importSeedConfigFile(strapi);
  strapi.stop(0);
}

async function startServer(strapi: Core.Strapi) {
  // need to call lifecycle functions manually
  if ('register' in lifecycles) {
    // biome-ignore lint/complexity/useLiteralKeys: syntax needed for prevent typescript compile error if not exist
    await lifecycles['register']({ strapi });
  }

  console.log('Startup Strapi...');
  await strapi.start().then(() => {
    const version = strapi.config.get('info.version');
    const hostname = os.hostname();
    const url = `http${process.env.HTTPS === '1' ? 's' : ''}://${hostname}:${strapi.config.get('server.port', 1337)}`;

    console.log(`
===============================================
🚀 ${strapi.config.get('info.name')}
Version: ${version}
Server runs on: ${url}
===============================================
    `);
  });

  if ('bootstrap' in lifecycles) {
    // biome-ignore lint/complexity/useLiteralKeys: syntax needed for prevent typescript compile error if not exist
    await lifecycles['bootstrap']({ strapi });
  }

  //call destroy lifecycle function on stop the procces
  if ('destroy' in lifecycles) {
    for (const signal of ['SIGINT', 'SIGTERM', 'SIGQUIT']) {
      process.on(signal, async () => {
        console.log(`Received ${signal}. Starting graceful shutdown...`);
        try {
          // biome-ignore lint/complexity/useLiteralKeys: syntax needed for prevent typescript compile error if not exist
          await lifecycles['destroy']({ strapi });
        } catch (error) {
          console.error('Error during destroy lifecycle:', error);
        }
        await strapi.destroy();
        process.exit(0);
      });
    }
  }
}

function help(strapi: Core.Strapi) {
  console.log(`
${strapi.config.get('info.description')}
The program have the following possible params:
--setup    : initialize permissions from config-sync plugin & import seed-config.json
--help     : show this informations
no params  : start the application.
  `);
  process.exit(0);
}

(async () => {
  const strapi = await createStrapi().load();
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    help(strapi);
  } else if (process.argv.includes('--setup')) {
    await setup(strapi);
  } else {
    await startServer(strapi);
  }
})();
