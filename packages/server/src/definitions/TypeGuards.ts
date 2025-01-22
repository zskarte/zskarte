import { Schema as SchemaNamespace, UID, Utils } from '@strapi/strapi';
import { CollectionType } from '@strapi/types/dist/core/core-api/controller';
import { Attribute } from '@strapi/types/dist/schema';

//Type analysing/Schema based on logic from Common.UID
interface IsOperationTypeSchema extends CollectionType {
  collectionName: 'operations';
}
interface IsOrganizationTypeSchema extends CollectionType {
  collectionName: 'organizations';
}
interface HasOperationTypeSchema extends CollectionType {
  attributes: {
    operation: any;
    // operation: Attribute.Relation<UID.Schema, Attribute.RelationKind.Any, IsOperationType>; TODO: Fix
  };
}
interface HasOrganizationTypeSchema extends CollectionType {
  attributes: {
    organization: any;
    // organization: Attribute.Relation<UID.Schema, Attribute.RelationKind.Any, IsOrganizationType>; TODO: FIX
  };
}
interface HasPublicTypeSchema extends CollectionType {
  attributes: {
    public: Attribute.Boolean;
  };
}

export type IsOperationType = Utils.Guard.Never<
  Extract<Utils.Object.KeysBy<SchemaNamespace.ContentTypes, IsOperationTypeSchema>, UID.ContentType>,
  UID.ContentType
>;
export type IsOrganizationType = Utils.Guard.Never<
  Extract<Utils.Object.KeysBy<SchemaNamespace.ContentTypes, IsOrganizationTypeSchema>, UID.ContentType>,
  UID.ContentType
>;
export type HasOperationType = Utils.Guard.Never<
  Extract<Utils.Object.KeysBy<SchemaNamespace.ContentTypes, HasOperationTypeSchema>, UID.ContentType>,
  UID.ContentType
>;
export type HasOrganizationType = Utils.Guard.Never<
  Extract<Utils.Object.KeysBy<SchemaNamespace.ContentTypes, HasOrganizationTypeSchema>, UID.ContentType>,
  UID.ContentType
>;
export type AccessCheckableType = IsOperationType | IsOrganizationType | HasOperationType | HasOrganizationType;
export type HasPublicType = Utils.Guard.Never<
  Extract<Utils.Object.KeysBy<SchemaNamespace.ContentTypes, HasPublicTypeSchema>, UID.ContentType>,
  UID.ContentType
>;

//unfortunately as types are striped away on runtime we have to define them here explizite. But the type definitions above help the intellisense show all possible/valid values.
const IsOperationTypes: IsOperationType[] = ['api::operation.operation'];
const IsOrganizationTypes: IsOrganizationType[] = ['api::organization.organization'];
const HasOperationTypes: HasOperationType[] = ['api::access.access', 'api::map-snapshot.map-snapshot'];
const HasOrganizationTypes: HasOrganizationType[] = [
  'plugin::users-permissions.user' as any, //TODO: Remove ANY
  'api::operation.operation',
  'api::wms-source.wms-source',
  'api::map-layer.map-layer',
];
const AccessCheckableTypes: AccessCheckableType[] = [
  ...IsOperationTypes,
  ...IsOrganizationTypes,
  ...HasOperationTypes,
  ...HasOrganizationTypes,
];

const HasPublicTypes: HasPublicType[] = ['api::wms-source.wms-source', 'api::map-layer.map-layer'];

export const isOperation = (obj): obj is IsOperationType => IsOperationTypes.includes(obj);
export const isOrganization = (obj): obj is IsOrganizationType => IsOrganizationTypes.includes(obj);
export const hasOperation = (obj): obj is HasOperationType => HasOperationTypes.includes(obj);
export const hasOrganization = (obj): obj is HasOrganizationType => HasOrganizationTypes.includes(obj);
export const isAccessCheckable = (obj): obj is AccessCheckableType => AccessCheckableTypes.includes(obj);
export const hasPublic = (obj): obj is HasPublicType => HasPublicTypes.includes(obj);
