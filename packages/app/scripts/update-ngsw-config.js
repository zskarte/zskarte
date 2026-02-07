const { execSync } = require('child_process');
const fs = require('fs');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
let version = packageJson.version;

if (process.env.COMMIT_SHA) {
  version = `${version}-${process.env.COMMIT_SHA}`;
} else {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    if (branch !== 'main') {
      const commitId = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      version = `${version}-${commitId}`;
    }
  } catch (error) {
    console.warn('Git command failed, use default version;', error);
  }
}

const date = new Date().toISOString().split('T')[0];

const ngswConfigPath = './ngsw-config.json';
const ngswConfig = JSON.parse(fs.readFileSync(ngswConfigPath, 'utf8'));

ngswConfig.appData = {
  version,
  buildDate: date,
};

fs.writeFileSync(ngswConfigPath, JSON.stringify(ngswConfig, null, 2));
console.log(`Updated ngsw-config.json with version ${version}`);
