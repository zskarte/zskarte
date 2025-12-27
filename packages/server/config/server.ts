import cronTasks from './cron-tasks';
import sea from 'node:sea';
const isSea = sea.isSea();

export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  cron: {
    enabled: true,
    tasks: cronTasks,
  },
  logger: {
    startup: {
      enabled: !isSea, // disable start message
    },
    updates: {
      enabled: !isSea, // disables update notifications
    },
  },
});
