import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

function generateRandomToken(length = 32) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function updateEnvFile() {
  const envPath = path.join(__dirname, '.env');
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
  };

  let updated = false;

  Object.entries(requiredTokens).forEach(([token, count]) => {
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
  });

  if (updated) {
    fs.writeFileSync(envPath, envContent.trim() + "\n");
    console.log('The .env file was updated with new generated required tokens.');
  }
}

export function loadEnvFile() {
  dotenv.config({ path: path.join(__dirname, '.env') });
}
