export default ({ env }) => ({
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  watchIgnoreFiles: ['**/data/**', '**/.git/**', '**/test/**', '**/config/sync/**'],
});
