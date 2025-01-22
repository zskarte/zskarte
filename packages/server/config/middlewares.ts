export default [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', process.env.STORAGE_URL],
          'media-src': ["'self'", 'data:', 'blob:', process.env.STORAGE_URL],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'Identifier', 'OperationId'],
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formLimit: '32mb',
      jsonLimit: '32mb',
      textLimit: '32mb',
      formidable: {
        maxFileSize: 32 * 1024 * 1024,
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  'global::globalSecurity',
  'global::superjson',
];
