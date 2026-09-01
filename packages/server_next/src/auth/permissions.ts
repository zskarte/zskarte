import type { Role } from './roles.js';

export const PERMISSION_KEYS = [
  'access.byId',
  'access.create',
  'access.delete',
  'access.generate',
  'access.list',
  'access.update',
  'journal.byId',
  'journal.byNumber',
  'journal.create',
  'journal.list',
  'journal.update',
  'mapLayer.byId',
  'mapLayer.create',
  'mapLayer.delete',
  'mapLayer.list',
  'mapLayer.update',
  'mapSnapshot.byId',
  'mapSnapshot.list',
  'operation.archive',
  'operation.byId',
  'operation.create',
  'operation.list',
  'operation.overview',
  'operation.patch',
  'operation.publishCurrentLocation',
  'operation.shadowDelete',
  'operation.submitChangeset',
  'operation.unarchive',
  'operation.updateMapLayers',
  'operation.updateMeta',
  'organization.current',
  'organization.forLogin',
  'organization.updateJournalEntryTemplate',
  'organization.updateLayerSettings',
  'organization.updateSettings',
  'wmsSource.byId',
  'wmsSource.create',
  'wmsSource.delete',
  'wmsSource.list',
  'wmsSource.update',
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

const permissions = <T extends readonly PermissionKey[]>(...values: T): ReadonlySet<PermissionKey> => new Set(values);

export const ROLE_PERMISSIONS: Record<Role, ReadonlySet<PermissionKey>> = {
  organization: permissions(
    'access.byId', 'access.create', 'access.delete', 'access.generate', 'access.list', 'access.update',
    'journal.byId', 'journal.byNumber', 'journal.create', 'journal.list', 'journal.update',
    'mapLayer.byId', 'mapLayer.create', 'mapLayer.delete', 'mapLayer.list', 'mapLayer.update',
    'mapSnapshot.byId', 'mapSnapshot.list',
    'operation.archive', 'operation.byId', 'operation.create', 'operation.list', 'operation.overview',
    'operation.publishCurrentLocation', 'operation.shadowDelete', 'operation.submitChangeset',
    'operation.unarchive', 'operation.updateMapLayers', 'operation.updateMeta',
    'organization.current', 'organization.updateJournalEntryTemplate', 'organization.updateLayerSettings',
    'organization.updateSettings',
    'wmsSource.byId', 'wmsSource.create', 'wmsSource.delete', 'wmsSource.list', 'wmsSource.update',
  ),
  guest: permissions(
    'access.delete', 'access.generate', 'access.list',
    'journal.byId', 'journal.byNumber', 'journal.create', 'journal.list', 'journal.update',
    'mapLayer.byId', 'mapLayer.list',
    'operation.archive', 'operation.byId', 'operation.create', 'operation.list', 'operation.overview',
    'operation.publishCurrentLocation', 'operation.shadowDelete', 'operation.unarchive',
    'operation.updateMapLayers', 'operation.updateMeta', 'organization.current', 'wmsSource.byId', 'wmsSource.list',
  ),
  operationwrite: permissions(
    'journal.byId', 'journal.byNumber', 'journal.create', 'journal.list', 'journal.update',
    'mapLayer.byId', 'mapLayer.create', 'mapLayer.list', 'mapLayer.update',
    'mapSnapshot.byId', 'mapSnapshot.list', 'operation.byId', 'operation.create', 'operation.list', 'operation.overview',
    'operation.publishCurrentLocation', 'operation.submitChangeset', 'operation.updateMapLayers',
    'organization.current', 'wmsSource.byId', 'wmsSource.create', 'wmsSource.list', 'wmsSource.update',
  ),
  operationread: permissions(
    'journal.byId', 'journal.byNumber', 'journal.list', 'mapLayer.byId', 'mapLayer.list',
    'mapSnapshot.byId', 'mapSnapshot.list', 'operation.byId', 'operation.list', 'operation.overview',
    'operation.publishCurrentLocation', 'organization.current', 'wmsSource.byId', 'wmsSource.list',
  ),
  public: permissions(
    'mapLayer.byId', 'mapLayer.list', 'organization.current', 'organization.forLogin',
    'wmsSource.byId', 'wmsSource.list',
  ),
};

export const hasPermission = (role: Role, permission: PermissionKey): boolean =>
  ROLE_PERMISSIONS[role].has(permission);
