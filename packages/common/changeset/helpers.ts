import { produce, type Patch } from 'immer';
import _ from 'lodash';
import { ChangesetInconsistentError, type IZsChangeset, type ZsMapState } from '@zskarte/types';

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
      if (changeId !== '0') {
        const message = `drawElement ${elemId} to change no longer exist on try apply changeset ${changeset.id}`;
        return { message, isInconsistent: true };
      }
    } else {
      if (!changesetIds) {
        if (changeId !== '0') {
          const message = `drawElementChangesetIds ${elemId} does not exist to verify changeset ${changeset.id}`;
          return { message, isInconsistent: true };
        }
      } else {
        if (!mapState.drawElements?.[elemId]) {
          const fistChange = changeset.patches.find(
            (patch) => patch.path[0] === 'drawElements' && patch.path[1] === elemId,
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
