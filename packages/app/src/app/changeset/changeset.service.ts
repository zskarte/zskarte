import {
  computed,
  effect,
  EnvironmentInjector,
  inject,
  Injectable,
  runInInjectionContext,
  Signal,
  signal,
} from '@angular/core';
import { ChangesetInconsistentError, IZsChangeset, ZsMapState } from '@zskarte/types';
import { applyPatches, Patch } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import { ZsMapStateService } from '../state/state.service';
import { SessionService } from '../session/session.service';
import { Signs } from '../map-renderer/signs';
import { ApiService } from '../api/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { db } from '../db/db';
import { toSignal } from '@angular/core/rxjs-interop';
import { I18NService } from '../state/i18n.service';
import { updateChangesetIdsAfterApply, verifyChangesetConsistency } from '@zskarte/common';

export const INITIAL_CHANGESET_ID = '0';
@Injectable({
  providedIn: 'root',
})
export class ChangesetService {
  private _state!: ZsMapStateService;
  private _session!: SessionService;
  private _api = inject(ApiService);
  private _i18n = inject(I18NService);
  private _snackBar = inject(MatSnackBar);
  private readonly _current = signal<IZsChangeset | null>(null);
  private readonly _baseMapState = signal<ZsMapState | null>(null);
  private readonly _unhandledPatches = signal<
    (
      | { patches: Patch[]; inversePatches: Patch[]; timestamp: number }
      | { newChangeset: true; messageNumber?: number; manual?: boolean; manualDescription?: string }
    )[]
  >([]);
  private handlingUnhandledPromise: Promise<void> | null = null;
  readonly unhandledPatchesCount = computed(() => this._unhandledPatches().length);
  private readonly _environmentInjector = inject(EnvironmentInjector);
  private _operationId: Signal<string | undefined> = signal<string | undefined>(undefined);

  readonly incommingChangesets = signal<IZsChangeset[]>([]);
  readonly incommingCount = computed(() => {
    return this.incommingChangesets().length;
  });
  readonly outgoingCount = signal<number>(0);
  readonly timeout = signal<number | null>(null, { equal: () => false });
  readonly saving = signal<boolean>(false);
  readonly saveError = signal<boolean>(false);
  readonly inconsistent = signal<boolean>(false);
  readonly errorChangeset = signal<IZsChangeset | null>(null);
  readonly blockFutureChanges = signal<boolean>(false);
  readonly offlineMode = signal<boolean>(false);
  readonly hasChanges = computed(() => {
    return this._current()?.startAt !== undefined;
  });
  readonly isManual = computed(() => {
    return this._current()?.manual === true;
  });
  readonly changeDescription = computed(() => {
    const changeset = this._current();
    if (!changeset) {
      return '<none>';
    }
    let description = '';
    if (changeset.messageNumber) {
      description += `Changes for #${changeset.messageNumber}\n`;
    }
    if (changeset.manualDescription) {
      description += `${changeset.manualDescription}\n`;
    }
    description += Array.from(changeset.description).join('\n');
    console.log('changeDescription', description, changeset);
    return description;
  });

  private _connectionId!: string;

  private timeoutId: NodeJS.Timeout | undefined = undefined;
  private _forceCommitMessageTimeout = 300000; //5min
  private _forceCommitManualTimeout = 300000; //5min
  private _forceCommitSingleTimeout = 30000; //30sec
  private _forceCommitDefaultTimeout = 60000; //60sec
  private _createMultiElementChangesetDelta = 30000; //30sec

  constructor() {
    effect(() => {
      const val = this.timeout();
      if (val === null) {
        clearTimeout(this.timeoutId);
      } else {
        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => {
          this._state.finishCurrentChangeset();
        }, val);
      }
    });
    let prevCurrent: IZsChangeset | null = null;
    effect(() => {
      const changeset = this._current();
      if (!changeset) {
        if (prevCurrent) {
          if (!prevCurrent.saved) {
            //TODO find better solution , should be submited if possible!
            //should submit on go back to operation list...
            db.changesetOutgoingQueue.put(prevCurrent);
          }
        }
      } else {
        //save in local db to prevent data loose on page refresh...
        db.changesetOutgoingQueue.put(changeset);
      }
      prevCurrent = changeset;
    });
  }

  public setStateService(state: ZsMapStateService): void {
    this._state = state;
  }

  public setSessionService(session: SessionService): void {
    this._session = session;

    //initialize session based signals
    runInInjectionContext(this._environmentInjector, () => {
      this._operationId = toSignal(this._session.observeOperationId());
      effect(async () => {
        const operationId = this._operationId();
        if (operationId) {
          let count = await db.changesetOutgoingQueue.where('operationId').equals(operationId).count();
          const current = await db.changesetOutgoingQueue
            .where('operationId')
            .equals(operationId)
            .and((c) => !c.endAt)
            .first();
          if (current) {
            count -= 1;
            this._current.set(current);
          } else {
            this._current.set(null);
          }
          this.outgoingCount.set(count);
        } else {
          this.outgoingCount.set(0);
          this._current.set(null);
        }
        this.timeout.set(null);
        this.saving.set(false);
        this.saveError.set(false);
        this.inconsistent.set(false);
        this.blockFutureChanges.set(false);
      });
    });
  }

  //TODO implement call
  public setConnectionId(connectionId: string): void {
    this._connectionId = connectionId;
  }

  private async submitChangeset(changeset: IZsChangeset) {
    if (this.inconsistent()) {
      this._snackBar.open('fix inconsistent changeset before try to submit', 'OK', {
        duration: 5000,
      });
      throw new ChangesetInconsistentError(changeset.id);
    }
    if (this.offlineMode()) {
      db.changesetOutgoingQueue.add(changeset);
      return;
    }
    this.saving.set(true);
    try {
      const response = await this._api.post('/api/operations/mapstate/changeset', changeset, {
        headers: {
          operationId: changeset.operationId,
          identifier: this._connectionId,
        },
      });
      if (response.error) {
        this.saveError.set(true);
        this.errorChangeset.set(changeset);
        if ((response.error as any).isInconsistent) {
          this.inconsistent.set(true);
          this._snackBar.open('changeset is inconsistent, you need to fix it', 'OK', {
            duration: 5000,
          });
          throw new ChangesetInconsistentError(changeset.id);
        }
        if ((response.error as any).isInvalid) {
          this.inconsistent.set(true);
          const message = `changeset ${changeset.id} is invalid and cannot be handled by backend: ${response.error.message}`;
          this._snackBar.open(message, 'OK', {
            duration: 5000,
          });
          throw new Error(message);
        }
        db.changesetOutgoingQueue.add(changeset);
        if (!this.offlineMode()) {
          this._snackBar.open('Publish changes failed, you are now in offline mode!', 'OK', {
            duration: 5000,
          });
          this.offlineMode.set(true);
        }
        this._state.applyChangesets([changeset]);
      } else {
        changeset.saved = true;
        db.changesetOutgoingQueue.delete(changeset.id);
        this.outgoingCount.update((old) => old - 1);
        this._state.applyChangesets([changeset]);
      }
    } finally {
      this.saving.set(false);
    }
  }

  public async submitOutgoing() {
    const operationId = this._operationId();
    if (operationId) {
      this.offlineMode.set(false);
      const changesets = await db.changesetOutgoingQueue.where('operationId').equals(operationId).sortBy('endAt');
      for (const c of changesets) {
        await this.submitChangeset(c);
      }
    }
  }

  public async finishChangeset(mapState: ZsMapState, manual: boolean) {
    this.timeout.set(null);
    const changeset = this._current();
    if (changeset === null) return;
    if (!changeset.firstChangeAt) {
      this._current.set(null);
      return;
    }
    const error = verifyChangesetConsistency(mapState, changeset);
    if (error) {
      this.inconsistent.set(true);
      throw new ChangesetInconsistentError(changeset.id);
    }
    if (this.incommingCount() > 0) {
      this._state.applyIncommingChangesets();
      //restart with new mapState
      await this._state.finishCurrentChangeset(manual);
      return;
    }

    //TODO merge changes from patches so add+remove is eliminated, add+replace+replace+replace is only add,...

    try {
      changeset.endAt = new Date().getTime();
      await this.submitChangeset(changeset);

      this._current.set(null);
      if (manual) {
        await this._state.handleUnhandledPatches();
      }
    } catch (error) {
      changeset.endAt = undefined;
      throw error;
    }
  }

  public async newChangeset(messageNumber?: number, manual = false, queueOnFail = false, manualDescription?: string) {
    try {
      await this._state.finishCurrentChangeset();

      //TODO handling workOffline for organisationId
      const organisationId = this._session.getOrganization()?.documentId;
      const operationId = this._session.getOperationId();
      const author = this._session.getLabel();

      if (organisationId && operationId && author) {
        const newChangeset: IZsChangeset = {
          parentChangesetId: '-1',
          id: uuidv4(),
          operationId,
          messageNumber,
          changedDrawElements: [],
          deletedDrawElements: [],
          drawElementsLastChangeset: {},
          organisationId,
          author,
          description: new Set(),
          startAt: new Date().getTime(),
          saved: false,
          patches: [],
          inversePatches: [],
          manual,
          manualDescription,
        };
        this._current.set(newChangeset);
        return newChangeset;
      } else {
        throw new Error('cannot create changeset as organisationId or operationId or author not defined.');
      }
    } catch (error) {
      if (queueOnFail) {
        this._unhandledPatches.update((currentItems) => [
          ...currentItems,
          { newChangeset: true, messageNumber, manual, manualDescription },
        ]);
      }
      throw error;
    }
  }

  public markManual() {
    this._current.update((changeset) => {
      if (changeset) {
        changeset = { ...changeset, manual: true };
        this.updateTimeout(changeset);
        return changeset;
      } else {
        return null;
      }
    });
  }

  public setManualDescription(description: string) {
    this._current.update((changeset) => {
      if (changeset) {
        return { ...changeset, manualDescription: description };
      } else {
        return null;
      }
    });
  }

  private getMessageNumberFromPatches(patches: Patch[]) {
    const messageNumberPatch = patches.find(
      (p) =>
        p.op !== 'remove' &&
        p.path[0] === 'drawElements' &&
        p.path[p.path.length - 1] === 'reportNumber' &&
        p.value.length > 0,
    );
    if (messageNumberPatch) {
      return messageNumberPatch.value[messageNumberPatch.value.length - 1];
    }
    return undefined;
  }

  private async verifyUsableChangesetActive(mapState: ZsMapState, patches: Patch[], modifiedDrawElements: Set<string>) {
    const changeset = this._current();
    if (changeset === null) {
      //handle: no changeset
      return this.newChangeset(this.getMessageNumberFromPatches(patches));
    } else if (changeset.firstChangeAt) {
      if (changeset.messageNumber || changeset.manual) {
        //for message and manual changeset all changes are allowed
        return changeset;
      }
      if (changeset.layer) {
        if (
          Array.from(modifiedDrawElements).some(
            (elemId) => this.getElement(mapState, patches, elemId)?.layer !== changeset.layer,
          )
        ) {
          //only changes for one layer per changeset is allowed
          return this.newChangeset(this.getMessageNumberFromPatches(patches));
        }
      }

      if (changeset.changedDrawElements.some((elemId) => !modifiedDrawElements.has(elemId))) {
        //new drawElement is changed
        const timestamp = new Date().getTime();
        if (changeset.firstChangeAt + this._createMultiElementChangesetDelta < timestamp) {
          //Multi element changeset creation time over
          return this.newChangeset(this.getMessageNumberFromPatches(patches));
        }
      }
    }
    //unused changesets are also valid
    return changeset;
  }

  public getElement(mapState: ZsMapState, patches: Patch[], elemId: string) {
    let element = mapState.drawElements[elemId];
    if (!element) {
      element = patches.find((p) => p.op === 'add' && p.path.length === 2 && p.path[1] === elemId)?.value;
    }
    return element;
  }

  public async handleUnhandledPatches(mapState: ZsMapState) {
    if (this.handlingUnhandledPromise) {
      return this.handlingUnhandledPromise.catch((err) => {
        /* ignore */
      });
    }
    if (this._unhandledPatches().length === 0) return;
    let resolveHandled!: () => void;
    let rejectHandled!: (e: unknown) => void;
    const patches = [...this._unhandledPatches()];
    let patch:
      | {
          patches: Patch[];
          inversePatches: Patch[];
          timestamp: number;
        }
      | {
          newChangeset: true;
          messageNumber?: number;
          manual?: boolean;
          manualDescription?: string;
        }
      | undefined;
    try {
      this.handlingUnhandledPromise = new Promise<void>((resolve, reject) => {
        resolveHandled = resolve;
        rejectHandled = reject;
      });

      patch = patches.shift();
      while (patch) {
        if ('newChangeset' in patch) {
          await this.newChangeset(patch.messageNumber, patch.manual, false, patch.manualDescription);
        } else {
          //TODO: mapstate is already updated, do we have problem with changesetId's?
          await this.addChange(mapState, patch.patches, patch.inversePatches, true);
        }
        patch = patches.shift();
      }
      this._unhandledPatches.set([]);
    } catch (error) {
      if (patch) {
        patches.unshift(patch);
      }
      this._unhandledPatches.set(patches);
      rejectHandled(error);
    } finally {
      this.handlingUnhandledPromise = null;
    }
  }

  public async addChange(mapState: ZsMapState, patches: Patch[], inversePatches: Patch[], handleUnhandled = false) {
    if (patches.length === 0) return;
    const modifiedDrawElements = patches.reduce<Set<string>>((acc, patch) => {
      if (patch.path.length > 1 && patch.path[0] === 'drawElements') {
        acc.add(patch.path[1] as string);
      }
      return acc;
    }, new Set());

    //make sure timeout is not handled while update
    this.timeout.set(null);
    const timestamp = new Date().getTime();

    //TODO: handle after fix finish problem and afterwards this._blockFutureChanges.set(false);
    if (!handleUnhandled && (this.unhandledPatchesCount() > 0 || this.saving())) {
      if (this.handlingUnhandledPromise) {
        await this.handlingUnhandledPromise.catch((err) => {
          /* ignore */
        });
      }
      this._unhandledPatches.update((currentItems) => [...currentItems, { patches, inversePatches, timestamp }]);
      return;
    }

    let changeset: IZsChangeset;
    try {
      changeset = await this.verifyUsableChangesetActive(mapState, patches, modifiedDrawElements);
      //copy to make later set triggers signal:
      changeset = { ...changeset };
    } catch (error) {
      this.blockFutureChanges.set(true);
      this._unhandledPatches.update((currentItems) => [...currentItems, { patches, inversePatches, timestamp }]);
      if (error instanceof ChangesetInconsistentError) {
        this._snackBar.open('You need to first solve the conflicts before update new fields!', 'OK', {
          duration: 2000,
        });
      }
      return;
    }

    //add/update default fields
    if (!changeset.firstChangeAt) {
      const changesetIds = mapState.changesetIds;
      changeset.parentChangesetId = changesetIds ? changesetIds[changesetIds.length - 1] : INITIAL_CHANGESET_ID;
      changeset.firstChangeAt = timestamp;
    }
    if (!changeset.layer) {
      const elemId = Array.from(modifiedDrawElements).find((id) => mapState.drawElements[id]?.layer);
      changeset.layer = elemId ? mapState.drawElements[elemId].layer : undefined;
    }
    changeset.lastChangeAt = timestamp;
    changeset.patches.push(...patches);
    changeset.inversePatches.unshift(...inversePatches);

    //handle change metadata
    patches.forEach((patch) => {
      if (patch.path[0] === 'drawElements') {
        const elemId = patch.path[1] as string;
        const element = this.getElement(mapState, patches, elemId);
        //update changedDrawElements list
        if (!changeset.changedDrawElements.includes(elemId)) {
          changeset.changedDrawElements.push(elemId);
          changeset.drawElementsLastChangeset[elemId] =
            mapState.drawElementChangesetIds[elemId]?.[mapState.drawElementChangesetIds[elemId].length - 1] || '0';
        }
        //update deletedDrawElements list
        if (patch.path.length === 2) {
          if (patch.op === 'remove') {
            if (!changeset.deletedDrawElements.includes(elemId)) {
              changeset.deletedDrawElements.push(elemId);
            }
          } else {
            if (changeset.deletedDrawElements.includes(elemId)) {
              changeset.deletedDrawElements.splice(changeset.deletedDrawElements.indexOf(elemId));
            }
          }
        }

        //TODO update description
        let type: string = element?.type;
        if (element?.symbolId) {
          const sign = Signs.getSignById(element.symbolId);
          if (sign) {
            type = this._i18n.getLabelForSign(sign);
          }
        }
        changeset.description.add(
          `${patch.op} ${patch.path[patch.path.length - 1] === 'coordinates' ? 'coordinates' : 'properties'} of ${type}${element?.name ? ' (' + element.name + ')' : ''}`,
        );
      } else {
        changeset.description.add(`${patch.op} ${patch.path[0]} ${patch.path[1]}`);
      }
    });
    this.updateTimeout(changeset);
    this._current.set(changeset);
  }

  private updateTimeout(changeset: IZsChangeset) {
    if (changeset.messageNumber) {
      this.timeout.set(this._forceCommitMessageTimeout);
    } else if (changeset.manual) {
      this.timeout.set(this._forceCommitManualTimeout);
    } else if (changeset.changedDrawElements.length === 1) {
      this.timeout.set(this._forceCommitSingleTimeout);
    } else {
      this.timeout.set(this._forceCommitDefaultTimeout);
    }
  }

  public addIncomming(changeset: IZsChangeset) {
    //not required to cache/permanent save the incomming, on relaod: new operation + mapstate with all applied changesets is loaded
    this.incommingChangesets.update((incomming) => [...incomming, changeset]);
  }

  public applyChangeset(mapState: ZsMapState, changeset: IZsChangeset) {
    //verify changeset not yet applied
    if (!mapState.changesetIds?.includes(changeset.id)) {
      //only apply if consistent
      const error = verifyChangesetConsistency(mapState, changeset);
      if (error) {
        throw new ChangesetInconsistentError(changeset.id);
      }
      mapState = applyPatches(mapState, changeset.patches);
      //update changesetIds on mapstate and drawElements
      mapState = updateChangesetIdsAfterApply(mapState, changeset);
      const operation = this._session.getOperation();
      if (operation) {
        if (!operation.changesets) {
          operation.changesets = {};
        }
        operation.changesets[changeset.id] = changeset;
      }
    }
    return mapState;
  }
}
