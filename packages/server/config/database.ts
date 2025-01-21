import fs from 'fs';
export default ({ env }) => {
  const dbConfig = {
    connection: {
      client: 'postgres',
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 55432),
        database: env('DATABASE_NAME', 'zskarte'),
        user: env('DATABASE_USERNAME', 'postgres'),
        password: env('DATABASE_PASSWORD', 'supersecret123'),
        ssl: env.bool('DATABASE_SSL', false),
      },
    },
  };
  if (env('DATABASE_CA_CERT', null)) {
    dbConfig.connection.connection.ssl = {
      //need to be false for allow self signed root ca not matching DATABASE_HOST
      rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_SELF', false),
      ca: fs.readFileSync(env('DATABASE_CA_CERT', null)),
    };
  }
  return dbConfig;
};
