import { spawn } from 'child_process';
import { exec as cbExec } from 'child_process';
import { promises as fs, existsSync } from 'fs';
import { promisify } from 'util';
import { glob } from 'glob';
import inquirer from 'inquirer';
import os from 'os';
const exec = promisify(cbExec);

(async () => {
  const response = await inquirer.prompt([
    { type: 'confirm', name: 'resetDb', message: 'Do you want to reset your database?', default: false },
  ]);

  const tempFolders = ['node_modules', 'dist', '.angular', '.strapi'];

  if (response.resetDb) {
    try {
      console.log('stop docker');
      await exec('docker compose down -v');
    } catch {
      // do nothing here
    }

    if (existsSync('data')) {
      if (os.platform() === 'linux') {
        console.log('call sudo for delete data folder');
        await exec('sudo rm -r data');
      } else {
        tempFolders.push('data');
      }
    }
  }

  const tempFoldersGlob = tempFolders.join(',');
  const [rootFolders, packageFolders] = await Promise.all([
    glob(`{${tempFoldersGlob}}/`),
    glob(`packages/*/{${tempFoldersGlob}}/`),
  ]);

  const folders = [...rootFolders, ...packageFolders];

  console.log('folders to clean up:', folders);

  await Promise.all(
    folders.map(async (folder) => {
      return await fs.rm(folder, { recursive: true, force: true });
    }),
  );

  console.log('cleanup successful');

  if (response.resetDb) {
    if (os.platform() === 'linux') {
      console.log('do linux/wsl prequisites');
      await fs.mkdir('data');
      await fs.mkdir('data/postgresql');
      //await fs.chown('data/postgresql', 1001, 1001);
      console.log('call sudo for change owner of postgresql');
      await exec('sudo chown 1001:1001 data/postgresql');
      await fs.mkdir('data/pgadmin');
      //await fs.chown('data/pgadmin', 5050, 5050);
      console.log('call sudo for change owner of pgadmin');
      await exec('sudo chown 5050:5050 data/pgadmin');

      console.log('linux/wsl prequisites done');
    }
  }

  console.log('reinstalling dependencies...');

  const child = spawn('npm', ['i'], {
    stdio: 'inherit',
    shell: true,
  });

  child.on('close', async (code) => {
    if (response.resetDb) {
      console.log('start docker...');
      await exec('npm run docker-run');
      console.log('import right configs');
      spawn('npm', ['run', 'server:import'], {
        stdio: 'inherit',
        shell: true,
      });
    }
  });
})();
