import type { Context } from 'koa';
import packageJson from '../../../../package.json';

export default {
  async compatibility(ctx: Context): Promise<void> {
    const frontendVersion =
      (ctx.query as Record<string, string>).version || (ctx.request.body as Record<string, string>).version;

    if (!frontendVersion) {
      ctx.status = 400;
      ctx.body = { error: 'version required' };
      return;
    }

    const backendVersion = (packageJson as { version?: string }).version || 'unknown';
    const isCompatible = checkVersionCompatibility(frontendVersion, backendVersion);

    ctx.body = {
      success: true,
      backendVersion,
      frontendVersion,
      isCompatible,
    };
  },
  async get(ctx: Context): Promise<void> {
    const backendVersion = (packageJson as { version?: string }).version || 'unknown';

    ctx.body = {
      success: true,
      backendVersion,
    };
  },
};

function checkVersionCompatibility(frontend: string, backend: string): boolean {
  const frontendMajor = frontend.split('.')[0];
  const backendMajor = backend.split('.')[0];
  return frontendMajor === backendMajor;
}
