//prevent to show Buffer warning from iconv-lite <- libmime <- mailcomposer <- sendmail <- @strapi/provider-email-sendmail <- @strapi/email (except the strapi ones all modules are very old...)
//@ts-ignore
process.noDeprecation = true;

import fs from 'fs';
import path from 'path';
import os from 'os';
import { createStrapi } from '@strapi/strapi';
import { loadEnvFile, updateEnvFile } from './utils/envManager';
import {
  importConfigSync,
  importSeedConfigFile,
  Strapi,
} from './utils/setup';
import lifecycles from './index';

//create missing secrets
updateEnvFile();

loadEnvFile();

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('uploadDir created');
}

async function setup(strapi: Strapi) {
  console.log('Perform system setup...');
  await strapi.start();
  await importConfigSync();
  await importSeedConfigFile(strapi);
  strapi.stop(0);
}

async function startServer(strapi: Strapi) {
  // need to call lifecycle functions manually
  if (lifecycles.register) {
    await lifecycles.register({ strapi });
  }

  console.log('Startup Strapi...');
  await strapi.start().then(() => {
    const version = strapi.config.get('info.version');
    const hostname = os.hostname();
    const url = `http${process.env.HTTPS === '1' ? 's' : ''}://${hostname}:${strapi.config.get('server.port', 1337)}`;

    console.log(`
===============================================
🚀 ZSKarte Server
Version: ${version}
Server runs on: ${url}
===============================================
    `);
  });

  if (lifecycles.bootstrap) {
    await lifecycles.bootstrap({ strapi });
  }

  //call destroy lifecycle function on stop the procces
  if (lifecycles.destroy) {
    ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
      process.on(signal, async () => {
        console.log(`Received ${signal}. Starting graceful shutdown...`);
        try {
          await lifecycles.destroy({ strapi });
        } catch (error) {
          console.error('Error during destroy lifecycle:', error);
        }
        await strapi.destroy();
        process.exit(0);
      });
    });
  }
}

function help() {
  console.log(`
Dies ist die Server Applikation von ZS Karte: https://github.com/zskarte/zskarte
In der .env Datei können DB system (sqlite|postgres) und die nötigen Parameter definiert werden.
Das Programm kennt folgende Aufruf Paramater:
--setup                : initialisieren/aktualisieren der permissions & importieren von seed-config.json
Ohne Parameter         : starten der Applikation.
  `);
}

async function main() {
  const strapi = await createStrapi().load();
  if (process.argv.includes('--help')) {
    help();
  } else if (process.argv.includes('--setup')) {
    await setup(strapi);
  } else {
    await startServer(strapi);
  }
}

main();
