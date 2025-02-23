import fs from 'fs';
import path from 'path';
import type { createStrapi } from '@strapi/strapi';
import { UID } from '@strapi/types';

export type Strapi = ReturnType<typeof createStrapi> extends { load(): Promise<infer T> } ? T : never;

interface SeedLinkRef {
  type: UID.ContentType;
  field: string;
  value: string;
}

export interface SeedConfig {
  adminUser: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
  };
  seedData: {
    type: UID.ContentType;
    uniqueField: string;
    data: any;
  }[];
  seedLinks: {
    left: SeedLinkRef;
    right: SeedLinkRef;
    field: string;
  }[];
}

interface IdMapping {
  [key: string]: {
    [oldValue: string]: string; // oldValue: newDocumentId
  };
}

export async function importConfigSync() {
  await strapi.plugin('config-sync').service('main').importAllConfig();
  console.log('Config-Sync Import completed');
}

export async function importSeedConfigFile(strapi: Strapi) {
  try {
    const configPath = path.join(__dirname, 'seed-config.json');
    if (fs.existsSync(configPath)) {
      const config: SeedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      await importSeedData(strapi, config);

      console.log('seed configs completed');
    } else {
      console.log('No seed-config.json found. Skipping seed configs.');
    }
  } catch (error) {
    console.error('Error during seed configs:', error);
  }
}

export async function importSeedData(strapi: Strapi, config: SeedConfig, force = false) {
  if (config.adminUser) {
    const existingUser = await strapi.query('admin::user').findOne({
      where: { email: config.adminUser.email },
    });

    if (existingUser) {
      console.log('Admin user already exist:', existingUser.email);
    } else {
      const superAdminRole = await strapi.admin.services.role.getSuperAdmin();

      const adminUser = await strapi.admin.services.user.create({
        firstname: config.adminUser.firstname,
        lastname: config.adminUser.lastname,
        email: config.adminUser.email,
        password: config.adminUser.password,
        roles: [superAdminRole.id],
        isActive: true,
      });

      console.log('Admin user created:', adminUser.email);
    }
  }

  const idMapping: IdMapping = {};

  async function findExistingItem(
    type: UID.ContentType,
    uniqueField: string,
    uniqueValue: any,
  ): Promise<string | null> {
    if (!idMapping[type]) {
      idMapping[type] = {};
    }

    // Check if the documentId is already in the mapping
    if (idMapping[type][uniqueValue]) {
      return idMapping[type][uniqueValue];
    }

    let existingItem;
    if (uniqueField === 'documentId') {
      existingItem = await strapi.documents(type).findFirst({
        filters: { externalId: uniqueValue } as any,
      });
    } else {
      existingItem = await strapi.documents(type).findFirst({
        filters: { [uniqueField]: uniqueValue },
      });
    }

    if (existingItem) {
      idMapping[type][uniqueValue] = existingItem.documentId;
      return existingItem.documentId;
    }

    return null;
  }

  async function createOrUpdateItem(
    type: UID.ContentType,
    uniqueField: string,
    uniqueValue: any,
    itemData: any,
  ): Promise<string> {
    const existingDocumentId = await findExistingItem(type, uniqueField, uniqueValue);

    if (existingDocumentId) {
      if (force) {
        const updatedItem = await strapi.documents(type).update({
          documentId: existingDocumentId,
          data: uniqueField === 'documentId' ? { ...itemData, externalId: uniqueValue } : itemData,
        });
        console.log(`Updated existing record for ${type}, ${uniqueField}: ${uniqueValue}`);
        return updatedItem.documentId;
      } else {
        console.log(`Using existing record for ${type}, ${uniqueField}: ${uniqueValue}`);
        return existingDocumentId;
      }
    }

    // Create new item
    const newItem = await strapi.documents(type).create({
      data: uniqueField === 'documentId' ? { ...itemData, externalId: uniqueValue } : itemData,
    });
    console.log(`Created new record for ${type}, ${uniqueField}: ${uniqueValue}`);

    idMapping[type][uniqueValue] = newItem.documentId;
    return newItem.documentId;
  }

  // Import all records
  for (const item of config.seedData) {
    const uniqueField = item.uniqueField || 'documentId';
    const uniqueValue = uniqueField === 'documentId' ? item.data.documentId : item.data[uniqueField];
    await createOrUpdateItem(item.type, uniqueField, uniqueValue, item.data);
  }

  async function updateRelations(item: (typeof config.seedLinks)[0]) {
    const leftDocumentId = await findExistingItem(item.left.type, item.left.field, item.left.value);
    const rightDocumentId = await findExistingItem(item.right.type, item.right.field, item.right.value);

    if (!leftDocumentId || !rightDocumentId) {
      console.log(
        `Skipping relation update: missing item for ${item.left.type}:${item.left.value} or ${item.right.type}:${item.right.value}`,
      );
      return;
    }

    const updateData = { [item.field]: [{ documentId: rightDocumentId }] };
    await strapi.documents(item.left.type).update({
      documentId: leftDocumentId,
      data: updateData,
    });
    console.log(`Updated relation for ${item.left.type}:${leftDocumentId} to ${item.right.type}:${rightDocumentId}`);
  }

  // Update all relations
  for (const link of config.seedLinks) {
    await updateRelations(link);
  }

  console.log('Import completed');
}
