import { spawn } from 'child_process';
import { exec as cbExec } from 'child_process';
import { promises as fs } from 'fs';
import { promisify } from 'util';
import { glob } from 'glob';
import inquirer from 'inquirer';
const exec = promisify(cbExec);

(async () => {
  const response = await inquirer.prompt([
    { type: 'confirm', name: 'resetDb', message: 'Do you want to reset your database?', default: false },
  ]);

  const tempFolders = ['node_modules', 'dist', '.angular', '.strapi'];

  if (response.resetDb) {
    tempFolders.push('data');
    try {
      await exec('docker-compose down -v');
    } catch {
      // do nothing here
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
  console.log('reinstalling dependencies...');

  spawn('npm', ['i'], {
    stdio: 'inherit',
    shell: true,
  });
})();
