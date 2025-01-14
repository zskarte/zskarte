export const StrapiLifecycleHooks = {
  AFTER_CREATE: 'afterCreate',
  AFTER_UPDATE: 'afterUpdate',
  AFTER_DELETE: 'afterDelete',
} as const;
export type StrapiLifecycleHook = (typeof StrapiLifecycleHooks)[keyof typeof StrapiLifecycleHooks];
