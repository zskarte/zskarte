const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Determine the project root
const projectRoot = path.resolve(__dirname, '..');

// Absolute path to the "optional-patches" root directory
const PATCHES_ROOT = path.join(projectRoot, 'optional-patches');

// Get all module directories inside "optional-patches"
const moduleDirs = fs
  .readdirSync(PATCHES_ROOT, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory()) // only directories
  .map((dirent) => dirent.name); // get directory names

moduleDirs.forEach((folderName) => {
  // Convert folder name to module name (replace first '+' with '/')
  let moduleName = folderName;
  if (moduleName.startsWith('@')) {
    moduleName = moduleName.replace('+', '/');
  }

  const modulePath = path.join(projectRoot, 'node_modules', moduleName);

  // Skip if module is not installed
  if (!fs.existsSync(modulePath)) {
    console.log(`ℹ Module "${moduleName}" not installed – skipping patch.`);
    return;
  }

  console.log(`➡ Applying patches for optional module "${moduleName}"...`);

  const relativePatchDir = path.relative(projectRoot, path.join(PATCHES_ROOT, moduleName));

  // Run patch-package for this module's patch directory
  const result = spawnSync('npx', ['patch-package', '--patch-dir', relativePatchDir], {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  // Log result but do not stop script on error
  if (result.status !== 0) {
    console.warn(`⚠ Warning: Patches for "${moduleName}" may not have been applied correctly.`);
  } else {
    console.log(`✅ Patches for "${moduleName}" applied successfully.`);
  }
});
