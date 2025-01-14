import type { Shared, Schema as SchemaNamespace, Attribute, Common, Utils } from '@strapi/strapi';

//Type analysing/Schema based on logic from Common.UID
interface IsOperationTypeSchema extends SchemaNamespace.CollectionType {
  collectionName: 'operations';
}
interface IsOrganizationTypeSchema extends SchemaNamespace.CollectionType {
  collectionName: 'organizations';
}
interface HasOperationTypeSchema extends SchemaNamespace.CollectionType {
  attributes: {
    operation: Attribute.Relation<Common.UID.Schema, Attribute.RelationKind.Any, IsOperationType>;
  };
}
interface HasOrganizationTypeSchema extends SchemaNamespace.CollectionType {
  attributes: {
    organization: Attribute.Relation<Common.UID.Schema, Attribute.RelationKind.Any, IsOrganizationType>;
  };
}
interface HasPublicTypeSchema extends SchemaNamespace.CollectionType {
  attributes: {
    public: Attribute.Boolean;
  };
}

export type IsOperationType = Utils.Guard.Never<Extract<Utils.Object.KeysBy<Shared.ContentTypes, IsOperationTypeSchema>, Common.UID.ContentType>, Common.UID.ContentType>;
export type IsOrganizationType = Utils.Guard.Never<Extract<Utils.Object.KeysBy<Shared.ContentTypes, IsOrganizationTypeSchema>, Common.UID.ContentType>, Common.UID.ContentType>;
export type HasOperationType = Utils.Guard.Never<Extract<Utils.Object.KeysBy<Shared.ContentTypes, HasOperationTypeSchema>, Common.UID.ContentType>, Common.UID.ContentType>;
export type HasOrganizationType = Utils.Guard.Never<Extract<Utils.Object.KeysBy<Shared.ContentTypes, HasOrganizationTypeSchema>, Common.UID.ContentType>, Common.UID.ContentType>;
export type AccessCheckableType = IsOperationType | IsOrganizationType | HasOperationType | HasOrganizationType;
export type HasPublicType = Utils.Guard.Never<Extract<Utils.Object.KeysBy<Shared.ContentTypes, HasPublicTypeSchema>, Common.UID.ContentType>, Common.UID.ContentType>;

//unfortunately as types are striped away on runtime we have to define them here explizite. But the type definitions above help the intellisense show all possible/valid values.
const IsOperationTypes: IsOperationType[] = [
  'api::operation.operation',
];
const IsOrganizationTypes: IsOrganizationType[] = [
  'api::organization.organization',
];
const HasOperationTypes: HasOperationType[] = [
  'api::access.access',
  'api::map-snapshot.map-snapshot',
];
const HasOrganizationTypes: HasOrganizationType[] = [
  'plugin::users-permissions.user',
  'api::operation.operation',
  'api::wms-source.wms-source',
  'api::map-layer.map-layer',
];
const AccessCheckableTypes: AccessCheckableType[] = [ ...IsOperationTypes, ...IsOrganizationTypes, ...HasOperationTypes, ...HasOrganizationTypes];

const HasPublicTypes: HasPublicType[] = [
  'api::wms-source.wms-source',
  'api::map-layer.map-layer',
];

export const isOperation = (obj): obj is IsOperationType => IsOperationTypes.includes(obj)
export const isOrganization = (obj): obj is IsOrganizationType => IsOrganizationTypes.includes(obj)
export const hasOperation = (obj): obj is HasOperationType => HasOperationTypes.includes(obj)
export const hasOrganization = (obj): obj is HasOrganizationType => HasOrganizationTypes.includes(obj)
export const isAccessCheckable = (obj): obj is AccessCheckableType => AccessCheckableTypes.includes(obj)
export const hasPublic = (obj): obj is HasPublicType => HasPublicTypes.includes(obj)
