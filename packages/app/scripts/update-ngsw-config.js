const { execSync } = require('child_process');
const fs = require('fs');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const plainVersion = packageJson.version;
let version = plainVersion;

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

function extractChangelogForVersion(changelogPath, version) {
  const content = fs.readFileSync(changelogPath, 'utf8');
  const lines = content.split('\n');
  let found = false;
  const changelog = [];
  
  for (const line of lines) {
    if (/^## /.test(line)) {
      if (found) break;
      if (line.includes(version)) {
        found = true;
        continue;
      }
    }
    
    if (found && line.trim()) {
      changelog.push(line);
    }
  }
  
  return changelog.join('\n').trim();
}

const changelogContent = extractChangelogForVersion('../../CHANGELOG.md', plainVersion);

ngswConfig.appData = {
  version,
  buildDate: date,
  changelog: changelogContent || 'Minor update'
};

fs.writeFileSync(ngswConfigPath, JSON.stringify(ngswConfig, null, 2));
console.log(`Updated ngsw-config.json with version ${version}`);
