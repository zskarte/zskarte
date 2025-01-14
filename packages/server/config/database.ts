export default ({ env }) => ({
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
});
