import { produce, type Patch } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import {
  ChangesetInconsistentError,
  DRAW_ELEMENTS,
  INITIAL_CHANGESET_ID,
  ZsMapDrawElementState,
  type IZsChangeset,
  type ZsMapState,
} from '@zskarte/types';

export const createNewChangeset = (
  organisationId: string,
  operationId: string,
  author: string,
  messageNumber?: number,
  manual = false,
  manualDescription?: string,
): IZsChangeset => {
  return {
    parentChangesetId: '-1',
    id: uuidv4(),
    operationId,
    messageNumber,
    changedDrawElements: [],
    deletedDrawElements: [],
    drawElementsLastChangeset: {},
    organisationId,
    author,
    description: [],
    startAt: new Date().getTime(),
    saved: false,
    patches: [],
    inversePatches: [],
    manual,
    manualDescription,
  };
};

export const isValidImmerPatch = (patch: Patch) => {
  if (typeof patch !== 'object' || patch === null) return false;
  if (!['replace', 'add', 'remove'].includes(patch.op)) return false;
  if (!Array.isArray(patch.path)) return false;
  if (patch.op === 'replace' || patch.op === 'add') {
    if (patch.value === undefined) return false;
  }
  return true;
};

export const verifyChangesetConsistency = (mapState: ZsMapState, changeset: IZsChangeset) => {
  for (const [elemId, changeId] of Object.entries(changeset.drawElementsLastChangeset)) {
    const changesetIds = mapState.drawElementChangesetIds?.[elemId];
    if (!mapState.drawElements?.[elemId] && !changesetIds) {
      if (changeId !== INITIAL_CHANGESET_ID) {
        const message = `drawElement ${elemId} to change no longer exist on try apply changeset ${changeset.id}`;
        return { message, isInconsistent: true };
      }
    } else {
      if (!changesetIds) {
        if (changeId !== INITIAL_CHANGESET_ID) {
          const message = `drawElementChangesetIds ${elemId} does not exist to verify changeset ${changeset.id}`;
          return { message, isInconsistent: true };
        }
      } else {
        if (!mapState.drawElements?.[elemId]) {
          const fistChange = changeset.patches.find(
            (patch) => patch.path[0] === DRAW_ELEMENTS && patch.path[1] === elemId,
          );
          if (!fistChange || fistChange.path.length !== 2 || (fistChange.op !== 'add' && fistChange.op !== 'replace')) {
            const message = `drawElement ${elemId} to change no longer exist (and first patch does not add it again) on try apply changeset ${changeset.id}`;
            return { message, isInconsistent: true };
          }
        }
        if (changesetIds[changesetIds.length - 1] !== changeId) {
          const message = `other change(${changesetIds[changesetIds.length - 1]}) for drawElement ${elemId} is applied before current changeset ${changeset.id}, last changeset should be ${changeId}`;
          return { message, isInconsistent: true };
        }
      }
    }
  }
  if (!changeset.patches || !_.isArray(changeset.patches)) return { message: 'patches empty/invalid', isInvalid: true };
  if (!changeset.patches.every((p) => isValidImmerPatch(p)))
    return { message: 'contains invalid patch', isInvalid: true };
  return null;
};

export const verifyChangesetCanUnapply = (mapState: ZsMapState, changeset: IZsChangeset) => {
  for (const [elemId, changeId] of Object.entries(changeset.drawElementsLastChangeset)) {
    if (!mapState.drawElements?.[elemId]) {
      if (!changeset.deletedDrawElements.includes(elemId)) {
        const message = `drawElement ${elemId} to revert does not exist on try unapply changeset ${changeset.id}`;
        return { message, isInconsistent: true };
      }
    } else {
      const changesetIds = mapState.drawElementChangesetIds[elemId];
      if (!changesetIds) {
        const message = `drawElementChangesetIds ${elemId} does not exist to verify unapply changeset ${changeset.id}`;
        return { message, isInconsistent: true };
      } else {
        const lastChangeset = changesetIds[changesetIds.length - 1];
        if (lastChangeset !== changeset.id) {
          if (lastChangeset !== changeId) {
            const message = `other change(${lastChangeset}) for drawElement ${elemId} is applied after current changeset ${changeset.id}, current should be last changeset`;
            return { message, isInconsistent: true };
          }
        }
      }
    }
  }
  if (!changeset.patches || !_.isArray(changeset.patches)) return { message: 'patches empty/invalid', isInvalid: true };
  if (!changeset.patches.every((p) => isValidImmerPatch(p)))
    return { message: 'contains invalid patch', isInvalid: true };
  return null;
};

export const updateChangesetIdsAfterApply = (mapState: ZsMapState, changeset: IZsChangeset) => {
  return produce<ZsMapState>(mapState, (draft) => {
    if (!draft.changesetIds) {
      draft.changesetIds = [];
    }
    draft.changesetIds.push(changeset.id);
    if (!draft.drawElementChangesetIds) {
      draft.drawElementChangesetIds = {};
    }
    changeset.changedDrawElements.forEach((elemId) => {
      if (!draft.drawElementChangesetIds[elemId]) {
        draft.drawElementChangesetIds[elemId] = [changeset.id];
      } else {
        draft.drawElementChangesetIds[elemId].push(changeset.id);
      }
    });
  });
};

export const updateChangesetIdsAfterUnapply = (mapState: ZsMapState, changeset: IZsChangeset) => {
  return produce<ZsMapState>(mapState, (draft) => {
    if (!draft.changesetIds) {
      draft.changesetIds = [];
    }
    const index = draft.changesetIds.indexOf(changeset.id);
    draft.changesetIds.splice(index, 1);
    if (!draft.drawElementChangesetIds) {
      draft.drawElementChangesetIds = {};
    }
    changeset.changedDrawElements.forEach((elemId) => {
      if (draft.drawElementChangesetIds[elemId]) {
        const drawElementChangesetIds = draft.drawElementChangesetIds[elemId];
        if (drawElementChangesetIds[drawElementChangesetIds.length - 1] !== changeset.id) {
          throw new ChangesetInconsistentError(changeset.id);
        }
        drawElementChangesetIds.pop();
      }
    });
  });
};

const isAddElemPatch = (p: Patch) => {
  return p.op === 'add' && p.path.length === 2;
};

const isAddElemIdPatch = (p: Patch, elemId: string) => {
  return isAddElemPatch(p) && p.path[1] === elemId;
};

export const getElement = (
  mapState: ZsMapState | undefined,
  patches: Patch[],
  inversePatches: Patch[],
  elemId: string,
) => {
  let element = mapState?.drawElements?.[elemId];
  if (!element) {
    element = patches.find((p) => isAddElemIdPatch(p, elemId))?.value;
  }
  if (!element) {
    element = inversePatches.find((p) => isAddElemIdPatch(p, elemId))?.value;
  }
  return element;
};

export const updateDescription = (
  changeset: IZsChangeset | null,
  mapState: ZsMapState | undefined,
  getSymbolName: (id: number) => string | null,
) => {
  if (!changeset) {
    return;
  }
  const description: string[] = [];
  if (changeset.messageNumber) {
    description.push(`Changes for #${changeset.messageNumber}`);
  }
  if (changeset.manualDescription) {
    description.push(`${changeset.manualDescription}`);
  }
  changeset.patches
    .filter((p) => p.path[0] === 'layers')
    .forEach((patch) => {
      if (patch.path.length === 2) {
        description.push(`${patch.op} layer ${patch.value?.name ?? ''}`);
      } else if (patch.path.length === 3 && patch.path[2] === 'name') {
        description.push(`rename layer ${patch.value ?? ''}`);
      }
    });

  const getElementDescription = (elemId: string) => {
    const element = getElement(mapState, changeset.patches, changeset.inversePatches, elemId);
    if (!element) {
      return 'element';
    }
    let type: string;
    if (element?.symbolId) {
      type = getSymbolName(element.symbolId) ?? `${element.type}:${element.symbolId}`;
    } else {
      type = element.type;
    }
    let name = element?.name;
    const nameChanges = changeset.patches.filter(
      (p) => p.path.length === 3 && p.path[1] === elemId && p.path[2] === 'name',
    );
    if (nameChanges.length > 0) {
      name = nameChanges[nameChanges.length - 1].value;
    }
    if (name) {
      return `${type} (${name})`;
    } else {
      return type;
    }
  };

  const changedCount = changeset.changedDrawElements.length;
  if (changedCount > 0) {
    if (changedCount <= 3) {
      for (const elemId of changeset.changedDrawElements) {
        const desc = getElementDescription(elemId);
        if (changeset.patches.find((p) => isAddElemIdPatch(p, elemId))) {
          description.push(`add ${desc}`);
        } else if (changeset.deletedDrawElements.includes(elemId)) {
          description.push(`remove ${desc}`);
        } else {
          const changedFields = new Set(
            changeset.patches
              .filter((p) => p.path[1] === elemId && p.path.length > 2)
              .map((p) => p.path[p.path.length - 1]),
          );
          if (changedFields.size > 4) {
            if (changedFields.has('coordinates')) {
              description.push(`update coordinates and properties of ${desc}`);
            } else {
              description.push(`update properties of ${desc}`);
            }
          } else if (changedFields.size > 0) {
            description.push(`update ${Array.from(changedFields).join(', ')} of ${desc}`);
          }
        }
      }
    } else {
      const changedCoords = new Set<string>();
      const changedProps = new Set<string>();
      for (const elemId of changeset.changedDrawElements) {
        const desc = getElementDescription(elemId);
        if (changeset.patches.find((p) => isAddElemIdPatch(p, elemId))) {
          description.push(`add ${desc}`);
        } else if (changeset.deletedDrawElements.includes(elemId)) {
          description.push(`remove ${desc}`);
        } else {
          const changedFields = new Set(
            changeset.patches
              .filter((p) => p.path[1] === elemId && p.path.length > 2)
              .map((p) => p.path[p.path.length - 1]),
          );
          if (changedFields.has('coordinates')) {
            changedCoords.add(desc);
          }
          changedFields.delete('coordinates');
          if (changedFields.size > 0) {
            changedProps.add(desc);
          }
        }
        description.push(`update coordinates of ${Array.from(changedCoords).join(', ')}`);
        description.push(`update properties of ${Array.from(changedProps).join(', ')}`);
      }
    }
  }
  changeset.description = description;
};

export const getModifiedDrawElements = (patches: Patch[]) => {
  return patches.reduce<Set<string>>((acc, patch) => {
    if (patch.path.length > 1 && patch.path[0] === DRAW_ELEMENTS) {
      acc.add(patch.path[1] as string);
    }
    return acc;
  }, new Set());
};

export const updateChangesetIdsFromPatches = (changeset: IZsChangeset, mapState: ZsMapState) => {
  const modifiedDrawElements = getModifiedDrawElements(changeset.patches);
  changeset.changedDrawElements = Array.from(modifiedDrawElements);
  changeset.deletedDrawElements = changeset.changedDrawElements.filter((elemId) =>
    changeset.patches.some(
      (patch) =>
        patch.op === 'remove' && patch.path.length === 2 && patch.path[0] === DRAW_ELEMENTS && patch.path[1] === elemId,
    ),
  );
  changeset.drawElementsLastChangeset = changeset.changedDrawElements.reduce(
    (acc, elemId) => {
      acc[elemId] =
        mapState.drawElementChangesetIds[elemId]?.[mapState.drawElementChangesetIds[elemId].length - 1] || '-2';

      return acc;
    },
    {} as Record<string, string>,
  );
  changeset.parentChangesetId = mapState.changesetIds?.[mapState.changesetIds.length - 1] || INITIAL_CHANGESET_ID;
};

export const createImmerDeepDiffForObjects = (
  oldObj: any,
  newObj: any,
  currentPath: (string | number)[] = [],
  ignoreKeys: string[] = [],
) => {
  const patches: Patch[] = [];
  const inversePatches: Patch[] = [];

  function diff(obj1: any, obj2: any, currentPath: (string | number)[] = [], ignoreKeys: string[] = []) {
    // FIRST: Primitiv handling
    if (!isObject(obj1) || !isObject(obj2)) {
      if (obj1 !== obj2) {
        const path = [...currentPath];
        patches.push({ path, op: 'replace', value: obj2 });
        inversePatches.push({ path, op: 'replace', value: obj1 });
      }
      return;
    }

    const oldKeys = obj1 ? Object.keys(obj1) : [];
    const newKeys = obj2 ? Object.keys(obj2) : [];

    // REMOVE: Keys only in oldObj (deleted properties)
    for (const key of oldKeys) {
      if (!newKeys.includes(key)) {
        // Skip if this key should be ignored (root level only)
        if (currentPath.length === 0 && ignoreKeys.includes(key)) {
          continue;
        }
        const path = [...currentPath, key];
        patches.push({ path, op: 'remove' });
        inversePatches.push({ path, op: 'add', value: obj1[key] });
      }
    }

    // ADD/REPLACE: Keys in newObj
    for (const key of newKeys) {
      // Skip root level keys that should be ignored
      if (currentPath.length === 0 && ignoreKeys.includes(key)) {
        continue;
      }

      const path = [...currentPath, key];
      const oldValue = obj1?.[key];
      const newValue = obj2?.[key];

      if (oldValue === undefined) {
        // ADD: New property that didn't exist before
        patches.push({ path, op: 'add', value: newValue });
        inversePatches.push({ path, op: 'remove' });
        continue;
      }

      // Array comparison: replace complete if different (coordinates, reportNumber)
      if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          patches.push({ path, op: 'replace', value: newValue });
          inversePatches.push({ path, op: 'replace', value: oldValue });
        }
        continue;
      }

      // Array to non-array or vice versa → replace entire property
      if (Array.isArray(oldValue) !== Array.isArray(newValue)) {
        patches.push({ path, op: 'replace', value: newValue });
        inversePatches.push({ path, op: 'replace', value: oldValue });
        continue;
      }

      // Both objects → recurse deeper (pass ignoreKeys only for root level)
      if (isObject(oldValue) && isObject(newValue)) {
        const subIgnoreKeys = currentPath.length === 0 ? ignoreKeys : [];
        diff(oldValue, newValue, path, subIgnoreKeys);
        continue;
      }

      // Primitive values different → replace
      if (oldValue !== newValue) {
        patches.push({ path, op: 'replace', value: newValue });
        inversePatches.push({ path, op: 'replace', value: oldValue });
      }
    }
  }

  function isObject(value: any): value is object {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  diff(oldObj, newObj, currentPath, ignoreKeys);
  return { patches, inversePatches };
};

export const updateChangesetFromDiff = (
  prevMapState: ZsMapState,
  mapState: ZsMapState,
  changeset: IZsChangeset,
): IZsChangeset => {
  const { patches, inversePatches } = createImmerDeepDiffForObjects(
    prevMapState,
    mapState,
    [],
    ['drawElementChangesetIds', 'changesetIds'],
  );
  changeset.patches.push(...patches);
  changeset.inversePatches.push(...inversePatches);
  updateChangesetIdsFromPatches(changeset, prevMapState);
  return changeset;
};
