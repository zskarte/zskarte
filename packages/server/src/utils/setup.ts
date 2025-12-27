import fs from 'node:fs';
import path from 'node:path';
import type { Core } from '@strapi/strapi';
import type { UID } from '@strapi/types';
import { program_dir } from './envManager.js';

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
    // biome-ignore lint/suspicious/noExplicitAny: type is generic
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

export async function importSeedConfigFile(strapi: Core.Strapi) {
  try {
    const configPath = path.join(program_dir, 'seed-config.json');
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

export async function importSeedData(strapi: Core.Strapi, config: SeedConfig, force = false) {
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
    uniqueValue: string | number,
  ): Promise<string | null> {
    if (!idMapping[type]) {
      idMapping[type] = {};
    }

    // Check if the documentId is already in the mapping
    if (idMapping[type][uniqueValue]) {
      return idMapping[type][uniqueValue];
    }

    let existingItem = await strapi.documents(type).findFirst({
      filters: { [uniqueField]: uniqueValue },
    });
    if (!existingItem && uniqueField === 'documentId') {
        const contentType = strapi.contentTypes[type];
        if ('externalId' in contentType.attributes){
          existingItem = await strapi.documents(type).findFirst({
            // biome-ignore lint/suspicious/noExplicitAny: existence of field checked above, but if not exist typescript compiler may complain
            filters: { externalId: uniqueValue } as any,
          });
        }
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
    uniqueValue: string | number,
    // biome-ignore lint/suspicious/noExplicitAny: type is generic
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
      }
      console.log(`Using existing record for ${type}, ${uniqueField}: ${uniqueValue}`);
      return existingDocumentId;
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
    try {
      await createOrUpdateItem(item.type, uniqueField, uniqueValue, item.data);
    } catch (err){
      console.error(`Error on add item ${item.type}: ${uniqueField}=${uniqueValue}, message: ${err}`)
    }
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
    try {
      await updateRelations(link);
    } catch (err){
      console.error(`Error on add relation for ${link.left.type}: ${link.left.field}=${link.left.value} to ${link.right.type}: ${link.right.field}=${link.right.value}, message: ${err}`)
    }
  }

  console.log('Import completed');
}
