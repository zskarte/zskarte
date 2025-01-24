const uploadProviders = (env) => {
  const providers = {
    local: {
      config: {
        sizeLimit: 32 * 1024 * 1024,
        localServer: {
          maxage: 300000,
        },
      },
    },
    azure: {
      config: {
        provider: 'strapi-provider-upload-azure-storage',
        providerOptions: {
          authType: env('STORAGE_AUTH_TYPE', 'default'),
          account: env('STORAGE_ACCOUNT'),
          accountKey: env('STORAGE_ACCOUNT_KEY'),
          serviceBaseURL: env('STORAGE_URL'),
          containerName: env('STORAGE_CONTAINER_NAME'),
          defaultPath: '',
          maxConcurrent: 10,
        },
      },
    },
  };
  return providers[env('STORAGE_PROVIDER', 'local')];
};

export default ({ env }) => ({
  upload: uploadProviders(env),
});
