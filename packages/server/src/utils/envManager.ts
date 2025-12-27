import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
export const program_dir = path.dirname(process.execPath);

function generateRandomToken(length = 32) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function updateEnvFile() {
  const envPath = path.join(program_dir, '.env');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  const requiredTokens = {
    API_TOKEN_SALT: 1,
    TRANSFER_TOKEN_SALT: 1,
    ADMIN_JWT_SECRET: 1,
    JWT_SECRET: 1,
    APP_KEYS: 4,
    ENCRYPTION_KEY: 1,
  };

  let updated = false;

  for (const [token, count] of Object.entries(requiredTokens)) {
    if (!envContent.includes(`\n${token}=`)) {
      let newTokenValue: string;
      if (count === 1) {
        newTokenValue = generateRandomToken();
      } else {
        newTokenValue = Array(count)
          .fill(null)
          .map(() => generateRandomToken())
          .join(',');
      }
      envContent += `\n${token}=${newTokenValue}`;
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(envPath, `${envContent.trim()}\n`);
    console.log('The .env file was updated with new generated required tokens.');
  }
}

export function loadEnvFile() {
  dotenv.config({ path: path.join(program_dir, '.env') });
}
