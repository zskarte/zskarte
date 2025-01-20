import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { glob } from 'glob';

(async () => {
  const tempFoldersGlob = 'node_modules,dist,.angular,.strapi';

  const [rootFolders, packageFolders] = await Promise.all([
    glob(`{${tempFoldersGlob}}/`),
    glob(`packages/*/{${tempFoldersGlob}}/`),
  ]);

  const folders = [...rootFolders, ...packageFolders];

  console.log('cleanup folders:', folders);

  await Promise.all(
    folders.map(async (folder) => {
      return await fs.rm(folder, { recursive: true, force: true });
    }),
  );

  console.log('cleanup successful');
  console.log('reinstalling dependencies...');

  const process = spawn('npm', ['i'], {
    stdio: 'inherit',
    shell: true,
  });
})();
