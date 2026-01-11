import { produce, type Patch } from 'immer';
import _ from 'lodash';
import type { IZsChangeset, ZsMapState } from '@zskarte/types';

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
    if (!mapState.drawElements?.[elemId]) {
      if (changeId !== '0') {
        const message = `drawElement ${elemId} to change no longer exist on try apply changeset ${changeset.id}`;
        return { message, isInconsistent: true };
      }
    } else {
      const changesetIds = mapState.drawElementChangesetIds[elemId];
      if (!changesetIds) {
        if (changeId !== '0') {
          const message = `drawElementChangesetIds ${elemId} does not exist to verify changeset ${changeset.id}`;
          return { message, isInconsistent: true };
        }
      } else {
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
      const drawElementChangesetIds = draft.drawElementChangesetIds[elemId];
      if (!drawElementChangesetIds) {
        draft.drawElementChangesetIds[elemId] = [changeset.id];
      } else {
        drawElementChangesetIds.push(changeset.id);
      }
    });
  });
};
