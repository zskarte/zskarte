import '@angular/compiler';
import 'zone.js';
import 'zone.js/testing';

//Attention NO import from vitest for { describe, it, expect, beforeEach, afterEach } -> they override the ones from angular which allow to use fakeAsync...
import { vi } from 'vitest';
import { verifyChangesetConsistency } from '@zskarte/common';

import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { EnvironmentInjector, Injectable } from '@angular/core';

import { ChangesetService, NO_CONFLICT_VALUE, OUR_INDEX } from './changeset.service';
import { ZsMapStateService } from '../state/state.service';
import { SessionService } from '../session/session.service';
import { SidebarService } from '../sidebar/sidebar.service';
import { I18NService } from '../state/i18n.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { db } from '../db/db';
import { BehaviorSubject } from 'rxjs';
import { enablePatches, Patch } from 'immer';
import {
  ChangesetInconsistentError,
  ChangesetMissingError,
  INITIAL_CHANGESET_ID,
  IZsChangeset,
  IZsChangesetConflictDetails,
  IZsChangesetConflictValue,
  IZsChangesetInternal,
  ZsMapDrawElementState,
  ZsMapDrawElementStateType,
  ZsMapLayerStateType,
  ZsMapState,
} from '@zskarte/types';
import { v4 as uuidv4 } from 'uuid';

// Need to be befor other imports
vi.mock('@zskarte/common', async (importOriginal) => {
  const actual: any = await importOriginal();
  const originalVerify = actual.verifyChangesetConsistency;
  return {
    ...actual,
    verifyChangesetConsistency: vi.fn(originalVerify),
  };
});

// -----------------------------------------------------------------------------
// VITEST MOCKS
// -----------------------------------------------------------------------------

const { trpcMock } = vi.hoisted(() => {
  const signKeyId = 'mock-sign-key-id';
  const trpcSuccessResponse = {
    success: true,
    data: {
      serverSavedAt: Date.now(),
      authorIp: '192.168.1.2',
      serverId: 'localhost-127.0.0.1',
      signKeyId,
      sign: 'MockValue',
    },
  };
  return {
    trpcMock: {
      operation: {
        submitChangeset: {
          mutate: vi.fn().mockResolvedValue(trpcSuccessResponse),
        },
      },
    },
  };
});
vi.mock('../api/trpc.client', () => ({ trpc: trpcMock }));
const snackBarMock = { open: vi.fn() };
const signKeyId = uuidv4();
const trpcSuccessResponse = {
  success: true,
  data: {
    serverSavedAt: Date.now(),
    authorIp: '192.168.1.2',
    serverId: 'localhost-127.0.0.1',
    signKeyId,
    sign: 'MockValue',
  },
};
const sidebarMock = { open: vi.fn() };
const i18nMock = { getLabelForSign: vi.fn().mockReturnValue('label') };

const configSubjectDefaultValue = {
  hiddenMode: true,
  automerge: true,
  conflictTakeOur: true,
  applyOnExpertViewOnly: false,
};
const configSubject = new BehaviorSubject(configSubjectDefaultValue);

const isChangesetMergeModeSubjectDefaultValue = false;
const isChangesetMergeModeSubject = new BehaviorSubject(isChangesetMergeModeSubjectDefaultValue);

const isExpertViewSubjectDefaultValue = false;
const isExpertViewSubject = new BehaviorSubject(isExpertViewSubjectDefaultValue);

const operationIdSubjectDefaultValue: string | null = 'op-1';
const operationIdSubject = new BehaviorSubject<string | null>(operationIdSubjectDefaultValue);

const stateMock: any = {
  finishCurrentChangeset: vi.fn().mockResolvedValue(undefined),
  observeChangesetConfig: () => configSubject.asObservable(),
  observeIsChangesetMergeMode: () => isChangesetMergeModeSubject.asObservable(),
  observeIsExpertView: () => isExpertViewSubject.asObservable(),
  isChangesetMergeMode: vi.fn().mockReturnValue(false),
  setChangesetMergeMode: vi.fn(),
  applyChangesets: vi.fn(),
  unapplyChangesets: vi.fn(),
  refreshMapState: vi.fn().mockResolvedValue(undefined),
  updateMapState: vi.fn(),
  getActiveLayer: vi.fn().mockReturnValue({ getId: () => 'L1' }),
  getErrorChangesetConflicts: vi.fn().mockReturnValue(null),
  handleUnhandledPatches: vi.fn().mockResolvedValue(undefined),
  stashCurrentChangeset: vi.fn(),
};

const sessionMock: any = {
  observeOperationId: () => operationIdSubject.asObservable(),
  sessionInitialized: vi.fn().mockReturnValue(false),
  getOrganization: vi.fn().mockReturnValue({ documentId: 'org-1' }),
  getOperationId: vi.fn().mockReturnValue('op-1'),
  getLabel: vi.fn().mockReturnValue('tester'),
  getOperation: vi.fn().mockReturnValue({ changesets: {} }),
  isWorkLocal: vi.fn().mockReturnValue(false),
};

let dbQueueMock: any;

function resetDbMock() {
  dbQueueMock = {
    delete: vi.fn().mockResolvedValue(undefined),
    put: vi.fn().mockResolvedValue(undefined),
    where: vi.fn().mockImplementation(() => ({
      equals: vi.fn().mockReturnValue({
        and: vi.fn().mockImplementation((predicate: any) => ({
          first: vi.fn().mockResolvedValue(null),
          sortBy: vi.fn().mockResolvedValue([]),
          count: vi.fn().mockResolvedValue(0),
          modify: vi.fn().mockResolvedValue(undefined),
        })),
      }),
    })),
  };
  Object.defineProperty(db, 'changesetOutgoingQueue', {
    value: dbQueueMock,
    writable: true,
  });
}

function resetSubjects() {
  configSubject.next(configSubjectDefaultValue);
  isChangesetMergeModeSubject.next(isChangesetMergeModeSubjectDefaultValue);
  isExpertViewSubject.next(isExpertViewSubjectDefaultValue);
  operationIdSubject.next(operationIdSubjectDefaultValue);
}

/**
 * Test-only subclass that exposes ChangesetService's protected internals as public, by
 * overriding each of them and delegating straight to `super`. This keeps the exact same
 * runtime behavior (production code calling `this._xxx(...)` still resolves to this override,
 * which just forwards to the real implementation) while making them directly callable AND
 * spy-able from the spec file without `service as any`.
 */
@Injectable()
class TestableChangesetService extends ChangesetService {
  public get current() {
    return this._current;
  }

  public get unhandledPatches() {
    return this._unhandledPatches;
  }

  public get commitSingleTimeout() {
    return this._commitSingleTimeout;
  }
  public get commitMultiTimeout() {
    return this._commitMultiTimeout;
  }
  public get commitMessageTimeout() {
    return this._commitMessageTimeout;
  }
  public get commitManualTimeout() {
    return this._commitManualTimeout;
  }

  public override _setErrorChangeset(errorChangeset: IZsChangeset | null, inconsistent: boolean) {
    return super._setErrorChangeset(errorChangeset, inconsistent);
  }

  public override _getChangedValuesForElem(patches: Patch[], elemId: string) {
    return super._getChangedValuesForElem(patches, elemId);
  }

  public override _removeAllConflictElements() {
    return super._removeAllConflictElements();
  }

  public override _getElementFromCachedElements(changeset: IZsChangesetInternal, elemId: string, index: number) {
    return super._getElementFromCachedElements(changeset, elemId, index);
  }

  public override _saveThereElements(mapState: ZsMapState, changeset: IZsChangesetInternal) {
    return super._saveThereElements(mapState, changeset);
  }

  public override _updateTimeout(changeset: IZsChangeset | null) {
    return super._updateTimeout(changeset);
  }

  public override _isArrayKey(key: string) {
    return super._isArrayKey(key);
  }

  public override _getChangedMetaValues(patches: Patch[]) {
    return super._getChangedMetaValues(patches);
  }

  public override _getOrigValues(element: ZsMapDrawElementState | ZsMapState, paths: Set<string>) {
    return super._getOrigValues(element, paths);
  }

  public override _mergeConflictValues(
    origValues: Record<string, any>,
    ourValues: Record<string, any>,
    thereValues: Record<string, any>,
  ) {
    return super._mergeConflictValues(origValues, ourValues, thereValues);
  }

  public override _addAllConflictElements() {
    return super._addAllConflictElements();
  }

  public override _unapplyOutgoingAndApplyIncomming() {
    return super._unapplyOutgoingAndApplyIncomming();
  }

  public override _submitChangeset(changeset: IZsChangesetInternal) {
    return super._submitChangeset(changeset);
  }

  public override _unstashAndApplyIncomming() {
    return super._unstashAndApplyIncomming();
  }

  public override _verifyUsableChangesetActive(
    mapState: ZsMapState,
    patches: Patch[],
    modifiedDrawElements: Set<string>,
  ) {
    return super._verifyUsableChangesetActive(mapState, patches, modifiedDrawElements);
  }

  public override _getOutgoingChangesets(operationId: string) {
    return super._getOutgoingChangesets(operationId);
  }

  public override _cleanupChangeset(changeset: IZsChangesetInternal) {
    return super._cleanupChangeset(changeset);
  }
}

describe('ChangesetService', () => {
  enablePatches();

  //prepare default elements, changeset, patches and mapState used in tests
  const origElement = {
    same: 'x',
    thereChanged: 'y',
    ourChanged: 'z',
    'our.changed.deep': 'z',
    thereRemoved: 'old',
    ourRemoved: 'old2',
    bothRemoved: 'orig',
    bothChanged: 'orig',
    bothChangedSame: 'old',
    ourRemovedThereChanged: 'orig',
    ourChangedThereRemoved: 'orig',
  };
  const ourElement = {
    same: 'x',
    thereChanged: 'y',
    ourChanged: 'change',
    'our.changed.deep': 'change',
    ourAdded: 'new',
    thereRemoved: 'old',
    bothChanged: 'our',
    bothChangedSame: 'new',
    ourChangedThereRemoved: 'our',
    bothAddedSame: 'new',
    bothAddedDifferent: 'our',
  };

  let ourDeltaElement, _unused: any;
  ({ same: _unused, thereChanged: _unused, thereRemoved: _unused, ...ourDeltaElement } = ourElement);
  ourDeltaElement.ourRemoved = null;
  ourDeltaElement.ourRemovedThereChanged = null;
  ourDeltaElement.bothRemoved = null;

  const thereElement = {
    same: 'x',
    thereChanged: 'change',
    ourChanged: 'z',
    'our.changed.deep': 'z',
    thereAdded: 'new',
    ourRemoved: 'old2',
    bothChanged: 'there',
    bothChangedSame: 'new',
    ourRemovedThereChanged: 'there',
    bothAddedSame: 'new',
    bothAddedDifferent: 'there',
  };

  const patchesKeeped: Patch[] = [
    { op: 'replace', path: ['drawElements', 'e1', 'ourChanged'], value: 'change' },
    { op: 'replace', path: ['drawElements', 'e1', 'our', 'changed', 'deep'], value: 'change' },
    { op: 'add', path: ['drawElements', 'e1', 'ourAdded'], value: 'new' },
    { op: 'remove', path: ['drawElements', 'e1', 'ourRemoved'] },
    { op: 'replace', path: ['drawElements', 'e1', 'bothChanged'], value: 'our' },
    { op: 'remove', path: ['drawElements', 'e1', 'ourRemovedThereChanged'] },
  ];
  const patchesReverted: Patch[] = [
    { op: 'remove', path: ['drawElements', 'e1', 'bothRemoved'] },
    { op: 'replace', path: ['drawElements', 'e1', 'bothChangedSame'], value: 'new' },
    { op: 'add', path: ['drawElements', 'e1', 'bothAddedSame'], value: 'new' },
    { op: 'add', path: ['drawElements', 'e1', 'bothAddedDifferent'], value: 'our' },
    { op: 'replace', path: ['drawElements', 'e1', 'ourChangedThereRemoved'], value: 'our' },
  ];
  const patchesAdded: Patch[] = [
    { op: 'add', path: ['drawElements', 'e1', 'ourChangedThereRemoved'], value: 'our' },
    { op: 'replace', path: ['drawElements', 'e1', 'bothAddedDifferent'], value: 'our' },
  ];
  const patchesOur: Patch[] = [...patchesKeeped, ...patchesReverted];

  const reversePatchesOur: Patch[] = [
    // Reverse of patchesKeeped
    { op: 'replace', path: ['drawElements', 'e1', 'ourChanged'], value: 'z' },
    { op: 'replace', path: ['drawElements', 'e1', 'our', 'changed', 'deep'], value: 'z' },
    { op: 'remove', path: ['drawElements', 'e1', 'ourAdded'] },
    { op: 'add', path: ['drawElements', 'e1', 'ourRemoved'], value: 'old2' },
    { op: 'replace', path: ['drawElements', 'e1', 'bothChanged'], value: 'orig' },
    { op: 'add', path: ['drawElements', 'e1', 'ourRemovedThereChanged'], value: 'orig' },

    // Reverse of patchesReverted
    { op: 'add', path: ['drawElements', 'e1', 'bothRemoved'], value: 'orig' },
    { op: 'replace', path: ['drawElements', 'e1', 'bothChangedSame'], value: 'old' },
    { op: 'remove', path: ['drawElements', 'e1', 'bothAddedSame'] },
    { op: 'remove', path: ['drawElements', 'e1', 'bothAddedDifferent'] },
    { op: 'replace', path: ['drawElements', 'e1', 'ourChangedThereRemoved'], value: 'orig' },
  ];

  const patchesThere: Patch[] = [
    { op: 'replace', path: ['drawElements', 'e1', 'thereChanged'], value: 'change' },
    { op: 'add', path: ['drawElements', 'e1', 'thereAdded'], value: 'new' },
    { op: 'remove', path: ['drawElements', 'e1', 'thereRemoved'] },
    { op: 'remove', path: ['drawElements', 'e1', 'bothRemoved'] },
    { op: 'replace', path: ['drawElements', 'e1', 'bothChanged'], value: 'there' },
    { op: 'replace', path: ['drawElements', 'e1', 'bothChangedSame'], value: 'new' },
    { op: 'remove', path: ['drawElements', 'e1', 'ourChangedThereRemoved'] },
    { op: 'replace', path: ['drawElements', 'e1', 'ourRemovedThereChanged'], value: 'there' },
    { op: 'add', path: ['drawElements', 'e1', 'bothAddedSame'], value: 'new' },
    { op: 'add', path: ['drawElements', 'e1', 'bothAddedDifferent'], value: 'there' },
  ];
  const reversePatchesThere: Patch[] = [
    { op: 'replace', path: ['drawElements', 'e1', 'thereChanged'], value: 'y' },
    { op: 'remove', path: ['drawElements', 'e1', 'thereAdded'] },
    { op: 'add', path: ['drawElements', 'e1', 'thereRemoved'], value: 'old' },
    { op: 'add', path: ['drawElements', 'e1', 'bothRemoved'], value: 'orig' },
    { op: 'replace', path: ['drawElements', 'e1', 'bothChanged'], value: 'orig' },
    { op: 'replace', path: ['drawElements', 'e1', 'bothChangedSame'], value: 'old' },
    { op: 'add', path: ['drawElements', 'e1', 'ourChangedThereRemoved'], value: 'orig' },
    { op: 'replace', path: ['drawElements', 'e1', 'ourRemovedThereChanged'], value: 'orig' },
    { op: 'remove', path: ['drawElements', 'e1', 'bothAddedSame'] },
    { op: 'remove', path: ['drawElements', 'e1', 'bothAddedDifferent'] },
  ];

  const patchesInitial: Patch[] = [
    { op: 'add', path: ['drawElements', 'e1'], value: populateDeepParamInElement(origElement) },
  ];
  const reversePatchesInitial: Patch[] = [{ op: 'remove', path: ['drawElements', 'e1'] }];

  const conflictValues: IZsChangesetConflictValue[] = [
    //{path:'same',orig:'x',there:'x',our:'x','conflict':false,selected:0,resolved:false},
    {
      path: 'thereChanged',
      orig: 'y',
      there: 'change',
      our: NO_CONFLICT_VALUE,
      conflict: false,
      selected: 1,
      resolved: false,
    },
    {
      path: 'thereAdded',
      orig: NO_CONFLICT_VALUE,
      there: 'new',
      our: NO_CONFLICT_VALUE,
      conflict: false,
      selected: 1,
      resolved: false,
    },
    {
      path: 'ourChanged',
      orig: 'z',
      there: NO_CONFLICT_VALUE,
      our: 'change',
      conflict: false,
      selected: 2,
      resolved: false,
    },
    {
      path: 'our.changed.deep',
      orig: 'z',
      there: NO_CONFLICT_VALUE,
      our: 'change',
      conflict: false,
      selected: 2,
      resolved: false,
    },
    {
      path: 'ourAdded',
      orig: NO_CONFLICT_VALUE,
      there: NO_CONFLICT_VALUE,
      our: 'new',
      conflict: false,
      selected: 2,
      resolved: false,
    },
    {
      path: 'thereRemoved',
      orig: 'old',
      there: null,
      our: NO_CONFLICT_VALUE,
      conflict: false,
      selected: 1,
      resolved: false,
    },
    {
      path: 'ourRemoved',
      orig: 'old2',
      there: NO_CONFLICT_VALUE,
      our: null,
      conflict: false,
      selected: 2,
      resolved: false,
    },
    { path: 'bothRemoved', orig: 'orig', there: null, our: null, conflict: false, selected: 2, resolved: false },
    { path: 'bothChanged', orig: 'orig', there: 'there', our: 'our', conflict: true, selected: 3, resolved: false },
    { path: 'bothChangedSame', orig: 'old', there: 'new', our: 'new', conflict: false, selected: 2, resolved: false },
    {
      path: 'ourRemovedThereChanged',
      orig: 'orig',
      there: 'there',
      our: null,
      conflict: true,
      selected: 3,
      resolved: false,
    },
    {
      path: 'ourChangedThereRemoved',
      orig: 'orig',
      there: null,
      our: 'our',
      conflict: true,
      selected: 3,
      resolved: false,
    },
    {
      path: 'bothAddedSame',
      orig: NO_CONFLICT_VALUE,
      there: 'new',
      our: 'new',
      conflict: false,
      selected: 2,
      resolved: false,
    },
    {
      path: 'bothAddedDifferent',
      orig: NO_CONFLICT_VALUE,
      there: 'there',
      our: 'our',
      conflict: true,
      selected: 3,
      resolved: false,
    },
  ];
  const sortByPath = <T extends { path: string }>(items: T[]) =>
    [...items].sort((a, b) => a.path.localeCompare(b.path));
  const conflictValuesSorted = sortByPath(conflictValues);

  function populateDeepParamInElement(elem) {
    const currentElem = { ...elem };
    const value = currentElem['our.changed.deep'];
    delete currentElem['our.changed.deep'];
    currentElem.our = { changed: { deep: value } };
    return currentElem;
  }

  const INIT_LAYER_ID = uuidv4();
  const MAP_STATE_ID = uuidv4();

  function getMapStateDefaults() {
    return {
      version: 3,
      id: MAP_STATE_ID,
      name: '',
      layers: { [INIT_LAYER_ID]: { id: INIT_LAYER_ID, type: ZsMapLayerStateType.DRAW, name: 'Layer 1' } },
      center: [0, 0],
    };
  }

  function getEmptyMapState(): ZsMapState {
    return {
      ...getMapStateDefaults(),
      changesetIds: [INITIAL_CHANGESET_ID],
      drawElements: {},
      drawElementChangesetIds: {},
    };
  }

  function getMapStateFor(elem, changesetIds: Array<string>): ZsMapState {
    return {
      ...getMapStateDefaults(),
      changesetIds,
      drawElements: { e1: populateDeepParamInElement(elem) },
      drawElementChangesetIds: { e1: changesetIds },
    };
  }

  const CHANGESET_ID_0 = 'c0';
  const CHANGESET_ID_1 = 'c1';
  const CHANGESET_ID_2 = 'c2';

  function getBaseMapState() {
    //base is used before changes, or if all changes are unapplied or stashed.
    return getMapStateFor(origElement, [INITIAL_CHANGESET_ID, CHANGESET_ID_0]);
  }

  function getStashedMapState() {
    return getBaseMapState();
  }

  function getLocalMapState() {
    //on local it mean the current state while drawing so not applied yet.
    return getMapStateFor(ourElement, [INITIAL_CHANGESET_ID, CHANGESET_ID_0]);
  }

  function getRemoteMapState() {
    //on remote the remote on is already applied
    return getMapStateFor(thereElement, [INITIAL_CHANGESET_ID, CHANGESET_ID_0, CHANGESET_ID_1]);
  }

  const changesetDefaultValues = {
    startAt: Date.now(),
    firstChangeAt: Date.now(),
    parentChangesetId: CHANGESET_ID_0,

    operationId: 'op-1',
    organisationId: 'org-1',
    author: 'user1',
    description: ['changing e1'],
    manual: false,
    saved: false,
  };
  const changesetSavedValues = {
    lastChangeAt: Date.now(),
    saved: true,
    serverSavedAt: Date.now(),
    authorIp: '192.168.1.2',
    serverId: 'localhost-127.0.0.1',
  };

  function getEmptyChangeset(): IZsChangeset {
    return {
      ...changesetDefaultValues,
      drawElementsLastChangeset: {},
      changedDrawElements: [],
      deletedDrawElements: [],
      id: 'empty-cs',
      patches: [],
      inversePatches: [],
      parentChangesetId: INITIAL_CHANGESET_ID,
    };
  }

  function getNewChangeset(): IZsChangeset {
    return {
      ...getEmptyChangeset(),
      firstChangeAt: undefined,
      id: 'new-cs',
    };
  }

  function getChangeset0(): IZsChangeset {
    return {
      ...changesetDefaultValues,
      drawElementsLastChangeset: { e1: INITIAL_CHANGESET_ID },
      changedDrawElements: ['e1'],
      deletedDrawElements: [],
      ...changesetSavedValues,
      id: CHANGESET_ID_0,
      patches: [...patchesInitial],
      inversePatches: [...reversePatchesInitial],
      parentChangesetId: INITIAL_CHANGESET_ID,
    };
  }

  function getChangeset1(): IZsChangeset {
    return {
      ...changesetDefaultValues,
      drawElementsLastChangeset: { e1: CHANGESET_ID_0 },
      changedDrawElements: ['e1'],
      deletedDrawElements: [],
      ...changesetSavedValues,
      id: CHANGESET_ID_1,
      patches: [...patchesThere],
      inversePatches: [...reversePatchesThere],
    };
  }

  function getChangeset2(): IZsChangeset {
    return {
      ...changesetDefaultValues,
      drawElementsLastChangeset: { e1: CHANGESET_ID_0 },
      changedDrawElements: ['e1'],
      deletedDrawElements: [],
      id: CHANGESET_ID_2,
      patches: [...patchesOur],
      inversePatches: [...reversePatchesOur],
    };
  }

  function getErrorChangeset(values: Partial<IZsChangesetInternal> = {}): IZsChangesetInternal {
    return {
      ...getChangeset2(),
      stashed: true,
      applied: false,
      baseMapState: getBaseMapState(),
      origDrawElements: {},
      ourDrawElements: {
        e1: populateDeepParamInElement(ourElement),
      },
      ...values,
    } as IZsChangesetInternal;
  }

  function setOperationChangesets(changesets: Record<string, IZsChangesetInternal>) {
    sessionMock.getOperation.mockReturnValue({
      changesets,
    });
  }

  function getThereMissingNoConflictConflictDetails(changeset: IZsChangeset): IZsChangesetConflictDetails {
    return {
      changeset: changeset,
      meta: [],
      conflicts: [
        {
          drawElementId: 'e1',
          missing: { orig: false, there: true, our: false },
          requiredPrefChangesetId: CHANGESET_ID_0,
          additionalChangesets: [],
          values: [
            {
              path: 'name',
              selected: OUR_INDEX,
              orig: 'orig-name',
              there: NO_CONFLICT_VALUE,
              our: 'updated-name',
              resolved: false,
              conflict: false,
            },
          ],
          conflict: false,
        },
      ],
      metaConflict: false,
      hasConflicts: false,
    };
  }

  let service: TestableChangesetService;

  function wait(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  beforeEach(async () => {
    resetDbMock();
    resetSubjects();
    vi.clearAllMocks();

    sessionMock.getOperation.mockReturnValue({
      changesets: {},
    });
    sessionMock.sessionInitialized.mockReturnValue(false);
    stateMock.updateMapState.mockReset();
    trpcMock.operation.submitChangeset.mutate.mockResolvedValue(trpcSuccessResponse);

    TestBed.configureTestingModule({
      providers: [
        { provide: ChangesetService, useClass: TestableChangesetService },
        { provide: ZsMapStateService, useValue: stateMock },
        { provide: SessionService, useValue: sessionMock },
        { provide: SidebarService, useValue: sidebarMock },
        { provide: I18NService, useValue: i18nMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        EnvironmentInjector,
      ],
    });

    service = TestBed.inject(ChangesetService) as TestableChangesetService;
    service.setStateService(stateMock);
    service.setSessionService(sessionMock);
    service.setSidebarService(sidebarMock as any);
    //make sure all signal / effects are initial run (e.g. inside setStateService)
    await wait(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial and configs', () => {
    it('should initialize default changesetConfig', () => {
      const cfg = service.changesetConfig();
      expect(cfg.hiddenMode).toBe(true);
      expect(cfg.automerge).toBe(true);
      expect(cfg.conflictTakeOur).toBe(true);
    });

    it('hasChanges should be false initially', () => {
      expect(service.hasChanges()).toBe(false);
    });

    it('overlayVisible reacts to config and mergeMode', fakeAsync(() => {
      // hiddenMode=true, mergeMode=false → false
      configSubject.next({ hiddenMode: true, automerge: true, conflictTakeOur: true, applyOnExpertViewOnly: false });
      isChangesetMergeModeSubject.next(false);
      flush();
      expect(service.overlayVisible()).toBe(false);

      // mergeMode=true → true
      //service.isChangesetMergeMode.set(true);
      isChangesetMergeModeSubject.next(true);
      flush();
      expect(service.overlayVisible()).toBe(true);

      // hiddenMode=false → true
      configSubject.next({ hiddenMode: false, automerge: true, conflictTakeOur: true, applyOnExpertViewOnly: false });
      //service.isChangesetMergeMode.set(false);
      isChangesetMergeModeSubject.next(false);
      flush();
      expect(service.overlayVisible()).toBe(true);

      // applyOnExpertViewOnly=true → false
      configSubject.next({ hiddenMode: false, automerge: true, conflictTakeOur: true, applyOnExpertViewOnly: true });
      flush();
      expect(service.overlayVisible()).toBe(false);

      // isExpertView=true → true
      isExpertViewSubject.next(true);
      flush();
      expect(service.overlayVisible()).toBe(true);
    }));
  });

  describe('timer handling', () => {
    it('timeout effect calls finishCurrentChangeset', fakeAsync(() => {
      let called = false;
      stateMock.finishCurrentChangeset = vi.fn().mockImplementation(() => {
        called = true;
      });
      service.timeout.set(1000);
      TestBed.flushEffects();

      tick(900);
      expect(called).toBe(false);

      tick(100);
      expect(called).toBe(true);
    }));

    it('clearTimeout when timeout set to null', fakeAsync(() => {
      service.timeout.set(1000);
      TestBed.flushEffects();

      tick(900);
      service.timeout.set(null);
      TestBed.flushEffects();

      tick(1500);
      expect(stateMock.finishCurrentChangeset).not.toHaveBeenCalled();
    }));

    it('_updateTimeout sets timeout depending on changeset type', () => {
      const now = Date.now();
      const base: IZsChangeset = {
        ...getChangeset2(),
        firstChangeAt: now - 1000,
        changedDrawElements: ['e1', 'e2'],
      };

      // messageNumber
      service._updateTimeout({ ...base, messageNumber: 1 });
      expect(service.timeout()).toBeLessThanOrEqual(service.commitMessageTimeout);

      // manual
      service._updateTimeout({ ...base, manual: true });
      expect(service.timeout()).toBeLessThanOrEqual(service.commitManualTimeout);

      // single element
      service._updateTimeout({ ...base, changedDrawElements: ['e1'] });
      expect(service.timeout()).toBeLessThanOrEqual(service.commitSingleTimeout);

      // multi element
      service._updateTimeout({ ...base, messageNumber: undefined, manual: false });
      expect(service.timeout()).toBeLessThanOrEqual(service.commitMultiTimeout);
    });
  });

  it('setSessionService resets state and loads outgoing', async () => {
    sessionMock.sessionInitialized.mockReturnValue(true);

    await service.setSessionService(sessionMock);

    expect(service.timeout()).toBeNull();
    expect(service.saving()).toBe(false);
    expect(service.outgoingCount()).toBe(0);
  });

  describe('updateOutgoing', () => {
    it('updateOutgoing PUTs changeset and updates count', async () => {
      vi.spyOn(service, '_getOutgoingChangesets').mockImplementation(() => ({
        count: vi.fn().mockResolvedValue(5),
        sortBy: vi.fn().mockResolvedValue([]),
      }));

      const cs = getChangeset2();
      await service.updateOutgoing(cs, false);

      expect(dbQueueMock.put).toHaveBeenCalledWith(cs);
      expect(service.outgoingCount()).toBe(5);
    });

    it('updateOutgoing DELETEs changeset when remove=true', async () => {
      const cs = getChangeset2();
      await service.updateOutgoing(cs, true);

      expect(dbQueueMock.delete).toHaveBeenCalledWith(CHANGESET_ID_2);
    });
  });
  describe('_unstashAndApplyIncomming', () => {
    it('unstashes the current changeset and applies queued incoming changesets', async () => {
      const incoming = [{ ...getChangeset0(), applied: false }];
      service.incommingChangesets.set(incoming as any);

      await service._unstashAndApplyIncomming();

      expect(stateMock.stashCurrentChangeset).toHaveBeenCalledWith();
      expect(stateMock.applyChangesets).toHaveBeenCalledWith(incoming);
    });

    it('falls back to refreshMapState and resets state when unstashing fails', async () => {
      stateMock.stashCurrentChangeset.mockImplementationOnce(() => {
        throw new Error('boom');
      });
      service.current.set({ ...getChangeset2(), stashed: false });
      service.incommingChangesets.set([{ ...getChangeset0() }] as any);

      await service._unstashAndApplyIncomming();

      expect(stateMock.refreshMapState).toHaveBeenCalledWith(false);
      expect(service.current().stashed).toBe(true);
      expect(service.incommingChangesets()).toEqual([]);
    });
  });

  describe('finishChangeset', () => {
    it('finishChangeset does nothing when no current changeset', async () => {
      service.current.set(null);

      await service.finishChangeset({} as any);

      expect(stateMock.applyChangesets).not.toHaveBeenCalled();
    });

    it('finishChangeset deletes empty changeset', async () => {
      const cs = { ...getChangeset2(), id: 'empty', startAt: Date.now(), patches: [], firstChangeAt: undefined };
      service.current.set(cs);
      vi.spyOn(service, 'updateOutgoing');

      await service.finishChangeset({} as any);

      expect(service.updateOutgoing).toHaveBeenCalledWith(cs, true);
    });

    it('finishChangeset cleans changeset and deletes if patches become empty', async () => {
      const cs = {
        ...getChangeset2(),
        cleaned: false,
        stashed: true,
        patches: [...patchesOur, ...reversePatchesOur],
        baseMapState: getBaseMapState(),
      };
      const mapState = getStashedMapState();

      service.current.set(cs);

      const cleanupSpy = vi.spyOn(service, '_cleanupChangeset');
      const updateOutgoingSpy = vi.spyOn(service, 'updateOutgoing');

      await service.finishChangeset(mapState);

      expect(cleanupSpy).toHaveBeenCalled();
      expect(updateOutgoingSpy).toHaveBeenCalledWith(cs, true);
      expect(service.current()).toBeNull();
    });

    it('finishChangeset cleans changeset and keeps it if patches remain', async () => {
      const cs = {
        ...getChangeset2(),
        cleaned: false,
        stashed: true,
        patches: [...patchesOur, ...reversePatchesOur.slice(0, 4)],
        baseMapState: getBaseMapState(),
      };
      const mapState = getStashedMapState();

      service.current.set(cs);
      const cleanupSpy = vi.spyOn(service, '_cleanupChangeset');
      const updateOutgoingSpy = vi.spyOn(service, 'updateOutgoing');

      await service.finishChangeset(mapState);

      expect(cleanupSpy).toHaveBeenCalled();
      expect(updateOutgoingSpy).toHaveBeenCalled();
      expect(service.current()).toBeNull();
      expect(cs.patches.length).toBe(reversePatchesOur.length - 4);
    });

    it('finishChangeset saves ourDrawElements when not stashed and not present', async () => {
      const cs: IZsChangesetInternal = {
        ...getChangeset2(),
        cleaned: true,
        stashed: false,
      };

      const mapState = getLocalMapState();

      service.current.set(cs);

      const cloneElementsSpy = vi.spyOn(service, 'cloneElements');

      // Path: stashed=false, incommingCount=0 → no _unstashAndApplyIncomming, no finishCurrentChangeset
      vi.spyOn(service, 'incommingCount').mockReturnValue(0);
      vi.spyOn(service, '_unstashAndApplyIncomming').mockResolvedValue(undefined);
      vi.spyOn(stateMock, 'finishCurrentChangeset').mockResolvedValue(undefined);

      const updateOutgoingSpy = vi.spyOn(service, 'updateOutgoing');

      await service.finishChangeset(mapState);

      expect(cloneElementsSpy).toHaveBeenCalledWith(mapState, cs.changedDrawElements);
      expect(cs.ourDrawElements).toEqual({ e1: populateDeepParamInElement(ourElement) });
      expect(service.current()).toBe(cs);
      //as finishCurrentChangeset does not recall the function in mock:
      expect(updateOutgoingSpy).not.toHaveBeenCalled();
    });

    it('finishChangeset unstashes and applies incoming when not stashed or incoming > 0', async () => {
      const cs = {
        ...getChangeset2(),
        cleaned: true,
        stashed: true,
      };

      const mapState = getStashedMapState();

      service.current.set(cs);
      vi.spyOn(service, 'incommingCount').mockReturnValue(1);

      //stateMock.stashCurrentChangeset = () => {cs.stashed = true;};
      const unstashSpy = vi.spyOn(service, '_unstashAndApplyIncomming').mockResolvedValue(undefined);
      //stateMock.finishCurrentChangeset = (manual) => service.finishChangeset({} as any, manual);
      const finishCurrentSpy = vi.spyOn(stateMock, 'finishCurrentChangeset').mockResolvedValue(undefined);
      const updateOutgoingSpy = vi.spyOn(service, 'updateOutgoing');

      await service.finishChangeset(mapState);

      expect(unstashSpy).toHaveBeenCalled();
      expect(finishCurrentSpy).toHaveBeenCalled();
      //as finishCurrentChangeset does not recall the function in mock:
      expect(updateOutgoingSpy).not.toHaveBeenCalled();
    });

    it('finishChangeset sets endAt, updates description and saves outgoing (online, no incoming)', async () => {
      const cs = {
        ...getChangeset2(),
        cleaned: true,
        stashed: true,
        baseMapState: getBaseMapState(),
        endAt: undefined,
      };
      const mapState = getStashedMapState();

      service.current.set(cs);

      vi.spyOn(service, 'incommingCount').mockReturnValue(0);
      vi.spyOn(service, '_unstashAndApplyIncomming').mockResolvedValue(undefined);
      vi.spyOn(stateMock, 'finishCurrentChangeset').mockResolvedValue(undefined);

      const updateOutgoingSpy = vi.spyOn(service, 'updateOutgoing');
      const submitOutgoingSpy = vi.spyOn(service, 'submitOutgoing').mockResolvedValue(undefined);

      // verifyChangesetConsistency ok
      vi.mocked(verifyChangesetConsistency).mockReturnValue(null);

      await service.finishChangeset(mapState);

      expect(cs.endAt).toBeDefined();
      expect(updateOutgoingSpy).toHaveBeenCalledWith(cs);
      expect(service.current()).toBeNull();
      expect(submitOutgoingSpy).toHaveBeenCalled();
    });

    it('finishChangeset applies changeset in offline mode', async () => {
      const cs = {
        ...getChangeset2(),
        cleaned: true,
        stashed: true,
        baseMapState: getBaseMapState(),
        endAt: undefined,
      };
      const mapState = getStashedMapState();

      service.current.set(cs);

      vi.spyOn(service, 'incommingCount').mockReturnValue(0);
      vi.spyOn(service, 'offlineMode').mockReturnValue(true);

      const updateOutgoingSpy = vi.spyOn(service, 'updateOutgoing');
      const applySpy = vi.spyOn(stateMock, 'applyChangesets');
      const submitOutgoingSpy = vi.spyOn(service, 'submitOutgoing').mockResolvedValue(undefined);

      await service.finishChangeset(mapState);

      expect(updateOutgoingSpy).toHaveBeenCalledWith(cs);
      expect(service.current()).toBeNull();
      expect(applySpy).toHaveBeenCalledWith([cs]);
      expect(submitOutgoingSpy).not.toHaveBeenCalled();
    });

    it('finishChangeset throws ChangesetInconsistentError when verify fails', async () => {
      const cs = {
        ...getChangeset2(),
        cleaned: true,
        stashed: true,
        baseMapState: getBaseMapState(),
        endAt: undefined,
      };
      const mapState = getStashedMapState();

      service.current.set(cs);

      vi.spyOn(service, 'incommingCount').mockReturnValue(0);
      vi.spyOn(service, 'offlineMode').mockReturnValue(false);

      const updateOutgoingSpy = vi.spyOn(service, 'updateOutgoing');
      const setErrorSpy = vi.spyOn(service, '_setErrorChangeset');

      vi.mocked(verifyChangesetConsistency).mockReturnValue({
        message: `drawElement e2 to change no longer exist on try apply changeset ${cs.id}`,
        isInconsistent: true,
      });

      await expect(service.finishChangeset(mapState, false)).rejects.toThrowError(
        expect.objectContaining({ message: expect.stringContaining(cs.id) }),
      );

      expect(updateOutgoingSpy).toHaveBeenCalledWith(cs);
      expect(service.current()).toBeNull();
      expect(setErrorSpy).toHaveBeenCalledWith(cs, true);
    });

    it('finishChangeset do not calls handleUnhandledPatches when applyUnhandledPatchesAfterwards is false', async () => {
      const cs = {
        ...getChangeset2(),
        cleaned: true,
        stashed: true,
        baseMapState: getBaseMapState(),
        endAt: undefined,
      };
      const mapState = getStashedMapState();

      service.current.set(cs);

      vi.spyOn(service, 'incommingCount').mockReturnValue(0);
      vi.spyOn(service, 'offlineMode').mockReturnValue(false);

      vi.spyOn(service, '_submitChangeset').mockResolvedValue(undefined);
      vi.mocked(verifyChangesetConsistency).mockReturnValue(null);

      const handleUnhandledSpy = vi.spyOn(stateMock, 'handleUnhandledPatches').mockResolvedValue(undefined);

      await service.finishChangeset(mapState, false);

      expect(handleUnhandledSpy).not.toHaveBeenCalled();
    });
  });

  describe('_submitChangeset', () => {
    let changeset: IZsChangesetInternal;

    beforeEach(() => {
      changeset = {
        ...getChangeset2(),
        cleaned: true,
        stashed: true,
        saved: false,
      };
    });

    it('throws ChangesetInconsistentError when inconsistent() is true', async () => {
      vi.spyOn(service, 'inconsistent').mockReturnValue(true);
      vi.spyOn(service, 'errorChangeset').mockReturnValue({ id: 'error-cs-id' });

      const snackBarSpy = vi.spyOn(snackBarMock, 'open').mockResolvedValue(undefined);

      await expect(service._submitChangeset(changeset)).rejects.toThrowError(
        expect.objectContaining({ message: expect.stringContaining('error-cs-id') }),
      );

      expect(snackBarSpy).toHaveBeenCalledWith('fix inconsistent changeset before try to submit', 'OK', {
        duration: 5000,
      });
    });

    it('applies changeset in offline mode without API call', async () => {
      vi.spyOn(service, 'inconsistent').mockReturnValue(false);
      vi.spyOn(service, 'offlineMode').mockReturnValue(true);

      const updateOutgoingSpy = vi.spyOn(service, 'updateOutgoing').mockResolvedValue(undefined);
      const applySpy = vi.spyOn(stateMock, 'applyChangesets');

      await service._submitChangeset(changeset);

      expect(updateOutgoingSpy).toHaveBeenCalledWith(changeset);
      expect(applySpy).toHaveBeenCalledWith([changeset]);
      expect(service.saving()).toBe(false);
    });

    it('handles isInconsistent error from API', async () => {
      vi.spyOn(service, 'inconsistent').mockReturnValue(false);
      vi.spyOn(service, 'offlineMode').mockReturnValue(false);

      const submitSpy = vi.spyOn(trpcMock.operation.submitChangeset, 'mutate').mockRejectedValue({
        isInconsistent: true,
        message: 'changeset is inconsistent',
      });

      const snackBarSpy = vi.spyOn(snackBarMock, 'open').mockResolvedValue(undefined);
      const unapplySpy = vi.spyOn(service, '_unapplyOutgoingAndApplyIncomming').mockResolvedValue(undefined);
      const setErrorSpy = vi.spyOn(service, '_setErrorChangeset');
      const updateOutgoingSpy = vi.spyOn(service, 'updateOutgoing');

      await expect(service._submitChangeset(changeset)).rejects.toThrowError(
        expect.objectContaining({ message: expect.stringContaining(changeset.id) }),
      );

      expect(submitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          operationId: changeset.operationId,
          changeset: expect.objectContaining({ id: changeset.id }),
        }),
      );

      expect(snackBarSpy).not.toHaveBeenCalled(); //not callen in hidden mode
      expect(unapplySpy).toHaveBeenCalled();
      expect(setErrorSpy).toHaveBeenCalledWith(changeset, true);
      expect(updateOutgoingSpy).not.toHaveBeenCalled();
    });

    it('handles isInvalid error from API', async () => {
      vi.spyOn(service, 'inconsistent').mockReturnValue(false);
      vi.spyOn(service, 'offlineMode').mockReturnValue(false);

      const submitSpy = vi.spyOn(trpcMock.operation.submitChangeset, 'mutate').mockRejectedValue({
        isInvalid: true,
        message: 'validation failed',
      });

      const snackBarSpy = vi.spyOn(snackBarMock, 'open').mockResolvedValue(undefined);
      const unapplySpy = vi.spyOn(service, '_unapplyOutgoingAndApplyIncomming').mockResolvedValue(undefined);
      const setErrorSpy = vi.spyOn(service, '_setErrorChangeset');
      const updateOutgoingSpy = vi.spyOn(service, 'updateOutgoing');

      await expect(service._submitChangeset(changeset)).rejects.toThrowError(
        expect.objectContaining({ message: expect.stringContaining('is invalid and cannot be handled') }),
      );

      expect(submitSpy).toHaveBeenCalled();
      expect(snackBarSpy).toHaveBeenCalledWith(
        expect.stringContaining('is invalid and cannot be handled by backend'),
        'OK',
        { duration: 5000 },
      );
      expect(unapplySpy).toHaveBeenCalled();
      expect(setErrorSpy).toHaveBeenCalledWith(changeset, true);
      expect(updateOutgoingSpy).not.toHaveBeenCalled();
    });

    it('handles server error (status >= 500) and switches to offline mode', async () => {
      vi.spyOn(service, 'inconsistent').mockReturnValue(false);
      vi.spyOn(service, 'offlineMode').mockReturnValue(false);

      const submitSpy = vi.spyOn(trpcMock.operation.submitChangeset, 'mutate').mockRejectedValue({
        data: { httpStatus: 503 },
        message: 'Service Unavailable',
      });

      const snackBarSpy = vi.spyOn(snackBarMock, 'open').mockResolvedValue(undefined);
      const updateOutgoingSpy = vi.spyOn(service, 'updateOutgoing').mockResolvedValue(undefined);
      const applyOutgoingSpy = vi.spyOn(service, 'applyOutgoingChangesets').mockResolvedValue(undefined);
      const offlineModeSetSpy = vi.spyOn(service.offlineMode, 'set');

      await service._submitChangeset(changeset);

      expect(submitSpy).toHaveBeenCalled();
      expect(snackBarSpy).toHaveBeenCalledWith('Publish changes failed, you are now in offline mode!', 'OK', {
        duration: 5000,
      });
      expect(offlineModeSetSpy).toHaveBeenCalledWith(true);
      expect(updateOutgoingSpy).toHaveBeenCalledWith(changeset);
      expect(applyOutgoingSpy).toHaveBeenCalled();
      expect(changeset.saved).toEqual(false);
    });

    it('handles NetworkError and switches to offline mode', async () => {
      vi.spyOn(service, 'inconsistent').mockReturnValue(false);
      vi.spyOn(service, 'offlineMode').mockReturnValue(false);

      const submitSpy = vi
        .spyOn(trpcMock.operation.submitChangeset, 'mutate')
        .mockRejectedValue(new Error('NetworkError: Failed to fetch'));

      const snackBarSpy = vi.spyOn(snackBarMock, 'open').mockResolvedValue(undefined);
      const updateOutgoingSpy = vi.spyOn(service, 'updateOutgoing').mockResolvedValue(undefined);
      const applyOutgoingSpy = vi.spyOn(service, 'applyOutgoingChangesets').mockResolvedValue(undefined);
      const offlineModeSetSpy = vi.spyOn(service.offlineMode, 'set');

      await service._submitChangeset(changeset);

      expect(submitSpy).toHaveBeenCalled();
      expect(snackBarSpy).toHaveBeenCalledWith('Publish changes failed, you are now in offline mode!', 'OK', {
        duration: 5000,
      });
      expect(offlineModeSetSpy).toHaveBeenCalledWith(true);
      expect(updateOutgoingSpy).toHaveBeenCalledWith(changeset);
      expect(applyOutgoingSpy).toHaveBeenCalled();
    });

    it('handles unknown error (status < 500) and throws', async () => {
      vi.spyOn(service, 'inconsistent').mockReturnValue(false);
      vi.spyOn(service, 'offlineMode').mockReturnValue(false);

      const submitSpy = vi.spyOn(trpcMock.operation.submitChangeset, 'mutate').mockRejectedValue({
        data: { httpStatus: 400 },
        message: 'Bad Request',
      });

      const snackBarSpy = vi.spyOn(snackBarMock, 'open').mockResolvedValue(undefined);
      const setErrorSpy = vi.spyOn(service, '_setErrorChangeset');
      const updateOutgoingSpy = vi.spyOn(service, 'updateOutgoing');

      await expect(service._submitChangeset(changeset)).rejects.toThrowError(
        expect.objectContaining({ message: expect.stringContaining('unknown error on submit changeset') }),
      );

      expect(submitSpy).toHaveBeenCalled();
      expect(snackBarSpy).toHaveBeenCalledWith(expect.stringContaining('unknown error on submit changeset'), 'OK', {
        duration: 5000,
      });
      expect(setErrorSpy).toHaveBeenCalledWith(changeset, false);
      expect(updateOutgoingSpy).not.toHaveBeenCalled();
    });

    it('handles successful API response', async () => {
      vi.spyOn(service, 'inconsistent').mockReturnValue(false);
      vi.spyOn(service, 'offlineMode').mockReturnValue(false);

      const updateOutgoingSpy = vi.spyOn(service, 'updateOutgoing').mockResolvedValue(undefined);
      const setErrorSpy = vi.spyOn(service, '_setErrorChangeset');
      const applySpy = vi.spyOn(stateMock, 'applyChangesets');
      const operation = {
        changesets: {},
        changesetSigns: {},
      };
      sessionMock.getOperation.mockReturnValue(operation);

      await service._submitChangeset(changeset);

      expect(trpcMock.operation.submitChangeset.mutate).toHaveBeenCalled();
      expect(applySpy).toHaveBeenCalledTimes(1);
      const appliedChangeset = applySpy.mock.calls[0][0][0];
      expect(appliedChangeset.saved).toBe(true);
      expect(appliedChangeset).toMatchObject({
        id: changeset.id,
      });
      expect(updateOutgoingSpy).toHaveBeenCalledWith(changeset, true);
      expect(setErrorSpy).toHaveBeenCalledWith(null, false);
      expect(operation?.changesetSigns[changeset.id]).not.toBeUndefined();
    });

    it('sets saving to false in finally block even on error', async () => {
      vi.spyOn(service, 'inconsistent').mockReturnValue(false);
      vi.spyOn(service, 'offlineMode').mockReturnValue(false);

      vi.spyOn(trpcMock.operation.submitChangeset, 'mutate').mockRejectedValue({
        data: { httpStatus: 500 },
        message: 'Server Error',
      });

      vi.spyOn(service, 'applyOutgoingChangesets').mockResolvedValue(undefined);
      vi.spyOn(service.offlineMode, 'set');

      try {
        await service._submitChangeset(changeset);
      } catch {
        // expected
      }

      expect(service.saving()).toBe(false);
    });
  });

  describe('addChange, newChangeset', () => {
    it('newChangeset creates changeset with session data', async () => {
      stateMock.finishCurrentChangeset.mockResolvedValueOnce(undefined);

      const result = await service.newChangeset(1, false);

      expect(result).toBeDefined();
      expect(service.current()).toBe(result);
    });

    it('newChangeset throws when organisationId, operationId or author are not available', async () => {
      sessionMock.isWorkLocal.mockReturnValueOnce(false);
      sessionMock.getOrganization.mockReturnValueOnce(undefined);

      await expect(service.newChangeset()).rejects.toThrow(
        'cannot create changeset as organisationId or operationId or author not defined.',
      );
      expect(service.current()).toBeNull();
    });

    it('newChangeset throws when author is not available', async () => {
      sessionMock.getLabel.mockReturnValueOnce(undefined);

      await expect(service.newChangeset()).rejects.toThrow(
        'cannot create changeset as organisationId or operationId or author not defined.',
      );
    });

    it('newChangeset queues creation for retry when queueOnFail=true and creation fails', async () => {
      sessionMock.getOrganization.mockReturnValueOnce(undefined);

      await expect(service.newChangeset(2, true, true, 'manual desc')).rejects.toThrow();

      expect(service.unhandledPatches()).toEqual([
        { newChangeset: true, messageNumber: 2, manual: true, manualDescription: 'manual desc' },
      ]);
    });

    it('newChangeset does not queue for retry when queueOnFail=false', async () => {
      sessionMock.getOrganization.mockReturnValueOnce(undefined);

      await expect(service.newChangeset(2, true, false)).rejects.toThrow();

      expect(service.unhandledPatches()).toEqual([]);
    });

    it('addChange ignores empty patches', async () => {
      const beforeTimeout = service.timeout();
      await service.addChange({} as any, [], [], false);
      expect(service.timeout()).toBe(beforeTimeout);
    });

    it('addChange queues when saving=true', async () => {
      service.saving.set(true);
      const patches: Patch[] = [{ op: 'add', path: ['drawElements', 'e1'], value: {} }];

      await service.addChange({} as any, patches, [], false);

      expect(service.unhandledPatchesCount()).toBe(1);
    });

    it('addChange queues and delegates to state.handleUnhandledPatches when unhandled patches are already pending', async () => {
      service.unhandledPatches.set([{ patches: [], inversePatches: [], timestamp: Date.now() }]);
      const patches: Patch[] = [{ op: 'add', path: ['drawElements', 'e1'], value: {} }];

      await service.addChange({} as any, patches, [], false);

      expect(stateMock.handleUnhandledPatches).toHaveBeenCalled();
      expect(service.unhandledPatchesCount()).toBe(2);
    });

    it('addChange shows a snackbar and queues the patch when the current changeset is inconsistent', async () => {
      vi.spyOn(service, '_verifyUsableChangesetActive').mockRejectedValue(new ChangesetInconsistentError('cs-broken'));
      const patches: Patch[] = [{ op: 'add', path: ['drawElements', 'e1'], value: {} }];

      await service.addChange({} as any, patches, [], false);

      expect(snackBarMock.open).toHaveBeenCalledWith(
        'You need to first solve the conflicts before update new fields!',
        'OK',
        { duration: 2000 },
      );
      expect(service.unhandledPatchesCount()).toBe(1);
      expect(service.current()).toBeNull();
    });

    it('addChange initializes a fresh changeset from the first patch on an element', async () => {
      service.current.set(null);

      const mapState = getBaseMapState();
      // give the element a layer so we can verify it gets picked up on the changeset
      mapState.drawElements['e1'] = { ...mapState.drawElements['e1'], layer: 'L1' };
      const elementBeforeChange = mapState.drawElements['e1'];

      const patches: Patch[] = [{ op: 'replace', path: ['drawElements', 'e1', 'ourChanged'], value: 'change' }];
      const inversePatches: Patch[] = [{ op: 'replace', path: ['drawElements', 'e1', 'ourChanged'], value: 'z' }];

      await service.addChange(mapState, patches, inversePatches, false);

      const current = service.current();
      expect(current).toBeDefined();
      expect(current.firstChangeAt).toBeDefined();
      expect(current.parentChangesetId).toBe(CHANGESET_ID_0);
      expect(current.baseMapState).toBe(mapState);
      expect(current.layer).toBe('L1');
      expect(current.changedDrawElements).toEqual(['e1']);
      expect(current.deletedDrawElements).toEqual([]);
      expect(current.drawElementsLastChangeset['e1']).toBe(CHANGESET_ID_0);
      // getElement resolves an already-existing element straight from mapState, i.e. its pre-change value
      expect(current.origDrawElements['e1']).toEqual(elementBeforeChange);
      expect(current.patches).toEqual(patches);
      expect(current.inversePatches).toEqual(inversePatches);
    });

    it('addChange records the added value as orig when a brand-new element is created', async () => {
      service.current.set(null);

      const mapState = getBaseMapState();
      const newElement = { id: 'e2', layer: 'L2' };
      // getElement falls back to the 'add' patch's value when the element is not yet in mapState.drawElements
      const patches: Patch[] = [{ op: 'add', path: ['drawElements', 'e2'], value: newElement }];

      await service.addChange(mapState, patches, [], false);

      const current = service.current();
      expect(current.changedDrawElements).toEqual(['e2']);
      expect(current.origDrawElements['e2']).toEqual(newElement);
      expect(current.layer).toBe('L2');
      // e2 has no changeset history yet on the mapState -> falls back to INITIAL_CHANGESET_ID
      expect(current.drawElementsLastChangeset['e2']).toBe(INITIAL_CHANGESET_ID);
    });

    it('addChange tracks deletedDrawElements on remove and clears it again once re-added', async () => {
      service.current.set(null);

      const mapState = getBaseMapState();
      const removePatch: Patch[] = [{ op: 'remove', path: ['drawElements', 'e1'] }];
      const addPatch: Patch[] = [{ op: 'add', path: ['drawElements', 'e1'], value: mapState.drawElements['e1'] }];

      await service.addChange(mapState, removePatch, [], false);
      expect(service.current().deletedDrawElements).toEqual(['e1']);

      await service.addChange(mapState, addPatch, [], false);
      expect(service.current().deletedDrawElements).toEqual([]);
    });
  });

  describe('incomming, outgoing', () => {
    let changeset1: IZsChangeset;
    let changeset2: IZsChangeset;
    let sortedChangesets: IZsChangeset[];

    beforeEach(() => {
      changeset1 = {
        ...getChangeset2(),
        id: 'cs-1',
        endAt: 2000,
        applied: true,
      };

      changeset2 = {
        ...getChangeset2(),
        id: 'cs-2',
        endAt: 1000,
        applied: false,
      };

      // sortBy('endAt') should return [cs-2, cs-1]
      sortedChangesets = [changeset2, changeset1];
    });

    it('incommingCount should return correct count', () => {
      service.incommingChangesets.set([changeset1, changeset2]);
      expect(service.incommingCount()).toBe(2);
    });
    it('addIncomming appends to queue', () => {
      service.addIncomming(changeset1);
      expect(service.incommingChangesets()[0]).toBe(changeset1);
    });

    it('applyIncommingChangesets applies and filters', () => {
      service.incommingChangesets.set([
        { ...changeset1, applied: false },
        { ...changeset2, applied: true },
      ] as any);

      service.applyIncommingChangesets();

      expect(stateMock.applyChangesets).toHaveBeenCalled();
      expect(service.incommingCount()).toBe(1);
    });

    it('submitOutgoing processes queued changesets', async () => {
      dbQueueMock.where.mockReturnValueOnce({
        equals: () => ({
          and: () => ({
            sortBy: vi.fn().mockResolvedValue([changeset1, changeset2]),
          }),
        }),
      });

      const submitChangesetSpy = vi.spyOn(service, '_submitChangeset');

      await service.submitOutgoing();

      expect(submitChangesetSpy).toHaveBeenCalledTimes(2);
    });

    it('shares an in-flight outgoing submission between concurrent callers', async () => {
      let release!: () => void;
      const submissionStarted = new Promise<void>((resolve) => {
        release = resolve;
      });
      dbQueueMock.where.mockReturnValue({
        equals: () => ({
          and: () => ({
            sortBy: vi.fn().mockResolvedValue([changeset1]),
          }),
        }),
      });

      const submitChangesetSpy = vi.spyOn(service, '_submitChangeset').mockReturnValue(submissionStarted);
      const first = service.submitOutgoing();
      const second = service.submitOutgoing();

      // Let the async database read reach _submitChangeset before asserting.
      await Promise.resolve();
      await Promise.resolve();

      expect(second).toBe(first);
      expect(submitChangesetSpy).toHaveBeenCalledTimes(1);

      release();
      await first;
    });

    describe('unapplyOutgoingChangesets', () => {
      it('does nothing when operationId is null', async () => {
        operationIdSubject.next(null);
        vi.spyOn(service, 'outgoingCount').mockReturnValue(2);

        const stateUnapplySpy = vi.spyOn(stateMock, 'unapplyChangesets');
        const dbPutSpy = vi.spyOn(db.changesetOutgoingQueue, 'put').mockResolvedValue('');

        await service.unapplyOutgoingChangesets();

        expect(stateUnapplySpy).not.toHaveBeenCalled();
        expect(dbPutSpy).not.toHaveBeenCalled();
      });

      it('does nothing when outgoingCount is 0', async () => {
        operationIdSubject.next('op-123');
        vi.spyOn(service, 'outgoingCount').mockReturnValue(0);

        const stateUnapplySpy = vi.spyOn(stateMock, 'unapplyChangesets');
        const dbPutSpy = vi.spyOn(db.changesetOutgoingQueue, 'put').mockResolvedValue('');

        await service.unapplyOutgoingChangesets();

        expect(stateUnapplySpy).not.toHaveBeenCalled();
        expect(dbPutSpy).not.toHaveBeenCalled();
      });

      it('unapplies changesets and puts not applied changesets back to queue', async () => {
        operationIdSubject.next('op-123');
        vi.spyOn(service, 'outgoingCount').mockReturnValue(2);

        const getOutgoingSpy = vi.spyOn(service, '_getOutgoingChangesets').mockReturnValue({
          sortBy: vi.fn().mockReturnValue(sortedChangesets),
        });

        const stateUnapplySpy = vi.spyOn(stateMock, 'unapplyChangesets');
        const dbPutSpy = vi.spyOn(db.changesetOutgoingQueue, 'put').mockResolvedValue('');

        await service.unapplyOutgoingChangesets();

        expect(getOutgoingSpy).toHaveBeenCalledWith('op-123');
        expect(stateUnapplySpy).toHaveBeenCalledWith(sortedChangesets);
        // Only changeset2 (applied=false) should go back into the queue
        expect(dbPutSpy).toHaveBeenCalledTimes(1);
        expect(dbPutSpy).toHaveBeenCalledWith(changeset2);
        expect(dbPutSpy).not.toHaveBeenCalledWith(changeset1);
      });

      it('puts all changesets back to queue when none are applied', async () => {
        const cs1NotApplied = { ...changeset1, applied: false };
        const cs2NotApplied = { ...changeset2, applied: false };
        const allNotApplied = [cs1NotApplied, cs2NotApplied];

        operationIdSubject.next('op-123');
        vi.spyOn(service, 'outgoingCount').mockReturnValue(2);

        vi.spyOn(service, '_getOutgoingChangesets').mockReturnValue({
          sortBy: vi.fn().mockReturnValue(allNotApplied),
        });

        const stateUnapplySpy = vi.spyOn(stateMock, 'unapplyChangesets');
        const dbPutSpy = vi.spyOn(db.changesetOutgoingQueue, 'put').mockResolvedValue(cs1NotApplied.id);

        await service.unapplyOutgoingChangesets();

        expect(stateUnapplySpy).toHaveBeenCalledWith(allNotApplied);
        expect(dbPutSpy).toHaveBeenCalledTimes(2);
        expect(dbPutSpy).toHaveBeenCalledWith(cs1NotApplied);
        expect(dbPutSpy).toHaveBeenCalledWith(cs2NotApplied);
      });

      it('puts no changesets back when all are applied', async () => {
        const cs1Applied = { ...changeset1, applied: true };
        const cs2Applied = { ...changeset2, applied: true };
        const allApplied = [cs1Applied, cs2Applied];

        operationIdSubject.next('op-123');
        vi.spyOn(service, 'outgoingCount').mockReturnValue(2);

        vi.spyOn(service, '_getOutgoingChangesets').mockReturnValue({
          sortBy: vi.fn().mockReturnValue(allApplied),
        });

        const stateUnapplySpy = vi.spyOn(stateMock, 'unapplyChangesets');
        const dbPutSpy = vi.spyOn(db.changesetOutgoingQueue, 'put').mockResolvedValue(cs1Applied.id);

        await service.unapplyOutgoingChangesets();

        expect(stateUnapplySpy).toHaveBeenCalledWith(allApplied);
        expect(dbPutSpy).not.toHaveBeenCalled();
      });

      it('ensures db.put is called in finally block even when unapplyChangesets throws', async () => {
        operationIdSubject.next('op-123');
        vi.spyOn(service, 'outgoingCount').mockReturnValue(2);

        const csNotApplied = { ...changeset1, applied: false };

        vi.spyOn(service, '_getOutgoingChangesets').mockReturnValue({
          sortBy: vi.fn().mockReturnValue([csNotApplied]),
        });

        const stateUnapplySpy = vi.spyOn(stateMock, 'unapplyChangesets').mockImplementation(() => {
          throw new Error('unapply failed');
        });
        const dbPutSpy = vi.spyOn(db.changesetOutgoingQueue, 'put').mockResolvedValue(csNotApplied.id);

        await expect(service.unapplyOutgoingChangesets()).rejects.toThrow('unapply failed');

        expect(stateUnapplySpy).toHaveBeenCalled();
        // db.put should still be executed in the finally block
        expect(dbPutSpy).toHaveBeenCalledWith(csNotApplied);
      });
    });

    describe('_unapplyOutgoingAndApplyIncomming', () => {
      it('applies queued incoming changesets directly when more than one is pending', async () => {
        vi.spyOn(service, 'unapplyOutgoingChangesets').mockResolvedValue(undefined);
        vi.spyOn(service, 'incommingCount').mockReturnValue(2);
        const applyIncommingSpy = vi.spyOn(service, 'applyIncommingChangesets').mockImplementation(() => {});
        const refreshSpy = vi.spyOn(stateMock, 'refreshMapState');

        await service._unapplyOutgoingAndApplyIncomming();

        expect(applyIncommingSpy).toHaveBeenCalled();
        expect(refreshSpy).not.toHaveBeenCalled();
      });

      it('refreshes mapState and resets the queues when at most one incoming changeset is pending', async () => {
        vi.spyOn(service, 'unapplyOutgoingChangesets').mockResolvedValue(undefined);
        vi.spyOn(service, 'incommingCount').mockReturnValue(1);
        operationIdSubject.next('op-123');
        const applyIncommingSpy = vi.spyOn(service, 'applyIncommingChangesets').mockImplementation(() => {});
        const refreshSpy = vi.spyOn(stateMock, 'refreshMapState').mockResolvedValue(undefined);
        const modifySpy = vi.fn().mockResolvedValue(undefined);
        vi.spyOn(service, '_getOutgoingChangesets').mockReturnValue({ modify: modifySpy });
        service.incommingChangesets.set([{ id: 'inc1' }] as any);

        await service._unapplyOutgoingAndApplyIncomming();

        expect(applyIncommingSpy).not.toHaveBeenCalled();
        expect(refreshSpy).toHaveBeenCalledWith(false);
        expect(modifySpy).toHaveBeenCalledWith({ applied: false });
        expect(service.incommingChangesets()).toEqual([]);
      });

      it('falls back to refreshMapState and resets the queues when unapplyOutgoingChangesets fails', async () => {
        vi.spyOn(service, 'unapplyOutgoingChangesets').mockRejectedValue(new Error('boom'));
        operationIdSubject.next('op-123');
        const applyIncommingSpy = vi.spyOn(service, 'applyIncommingChangesets').mockImplementation(() => {});
        const refreshSpy = vi.spyOn(stateMock, 'refreshMapState').mockResolvedValue(undefined);
        const modifySpy = vi.fn().mockResolvedValue(undefined);
        vi.spyOn(service, '_getOutgoingChangesets').mockReturnValue({ modify: modifySpy });
        service.incommingChangesets.set([{ id: 'inc1' }] as any);

        await expect(service._unapplyOutgoingAndApplyIncomming()).resolves.toBeUndefined();

        expect(applyIncommingSpy).not.toHaveBeenCalled();
        expect(refreshSpy).toHaveBeenCalledWith(false);
        expect(modifySpy).toHaveBeenCalledWith({ applied: false });
        expect(service.incommingChangesets()).toEqual([]);
      });
    });

    describe('applyOutgoingChangesets', () => {
      it('does nothing when operationId is null', async () => {
        operationIdSubject.next(null);
        vi.spyOn(service, 'outgoingCount').mockReturnValue(2);

        const stateApplySpy = vi.spyOn(stateMock, 'applyChangesets');
        const dbPutSpy = vi.spyOn(db.changesetOutgoingQueue, 'put').mockResolvedValue('');

        await service.applyOutgoingChangesets();

        expect(stateApplySpy).not.toHaveBeenCalled();
        expect(dbPutSpy).not.toHaveBeenCalled();
      });

      it('does nothing when outgoingCount is 0', async () => {
        operationIdSubject.next('op-123');
        vi.spyOn(service, 'outgoingCount').mockReturnValue(0);

        const stateApplySpy = vi.spyOn(stateMock, 'applyChangesets');
        const dbPutSpy = vi.spyOn(db.changesetOutgoingQueue, 'put').mockResolvedValue('');

        await service.applyOutgoingChangesets();

        expect(stateApplySpy).not.toHaveBeenCalled();
        expect(dbPutSpy).not.toHaveBeenCalled();
      });

      it('applies changesets and puts applied changesets to queue', async () => {
        operationIdSubject.next('op-123');
        vi.spyOn(service, 'outgoingCount').mockReturnValue(2);

        const getOutgoingSpy = vi.spyOn(service, '_getOutgoingChangesets').mockReturnValue({
          sortBy: vi.fn().mockReturnValue(sortedChangesets),
        });

        const stateApplySpy = vi.spyOn(stateMock, 'applyChangesets');
        const dbPutSpy = vi.spyOn(db.changesetOutgoingQueue, 'put').mockResolvedValue('');

        await service.applyOutgoingChangesets();

        expect(getOutgoingSpy).toHaveBeenCalledWith('op-123');
        expect(stateApplySpy).toHaveBeenCalledWith(sortedChangesets);
        // Only changeset1 (applied=true) should go into the queue
        expect(dbPutSpy).toHaveBeenCalledTimes(1);
        expect(dbPutSpy).toHaveBeenCalledWith(changeset1);
        expect(dbPutSpy).not.toHaveBeenCalledWith(changeset2);
      });

      it('puts all changesets to queue when all are applied', async () => {
        const cs1Applied = { ...changeset1, applied: true };
        const cs2Applied = { ...changeset2, applied: true };
        const allApplied = [cs1Applied, cs2Applied];

        operationIdSubject.next('op-123');
        vi.spyOn(service, 'outgoingCount').mockReturnValue(2);

        vi.spyOn(service, '_getOutgoingChangesets').mockReturnValue({
          sortBy: vi.fn().mockReturnValue(allApplied),
        });

        const stateApplySpy = vi.spyOn(stateMock, 'applyChangesets');
        const dbPutSpy = vi.spyOn(db.changesetOutgoingQueue, 'put').mockResolvedValue(cs1Applied.id);

        await service.applyOutgoingChangesets();

        expect(stateApplySpy).toHaveBeenCalledWith(allApplied);
        expect(dbPutSpy).toHaveBeenCalledTimes(2);
        expect(dbPutSpy).toHaveBeenCalledWith(cs1Applied);
        expect(dbPutSpy).toHaveBeenCalledWith(cs2Applied);
      });

      it('puts no changesets when none are applied', async () => {
        const cs1NotApplied = { ...changeset1, applied: false };
        const cs2NotApplied = { ...changeset2, applied: false };
        const noneApplied = [cs1NotApplied, cs2NotApplied];

        operationIdSubject.next('op-123');
        vi.spyOn(service, 'outgoingCount').mockReturnValue(2);

        vi.spyOn(service, '_getOutgoingChangesets').mockReturnValue({
          sortBy: vi.fn().mockReturnValue(noneApplied),
        });

        const stateApplySpy = vi.spyOn(stateMock, 'applyChangesets');
        const dbPutSpy = vi.spyOn(db.changesetOutgoingQueue, 'put').mockResolvedValue(cs1NotApplied.id);

        await service.applyOutgoingChangesets();

        expect(stateApplySpy).toHaveBeenCalledWith(noneApplied);
        expect(dbPutSpy).not.toHaveBeenCalled();
      });

      it('ensures db.put is called in finally block even when applyChangesets throws', async () => {
        operationIdSubject.next('op-123');
        vi.spyOn(service, 'outgoingCount').mockReturnValue(2);

        const csApplied = { ...changeset1, applied: true };

        vi.spyOn(service, '_getOutgoingChangesets').mockReturnValue({
          sortBy: vi.fn().mockReturnValue([csApplied]),
        });

        const stateApplySpy = vi.spyOn(stateMock, 'applyChangesets').mockImplementation(() => {
          throw new Error('apply failed');
        });
        const dbPutSpy = vi.spyOn(db.changesetOutgoingQueue, 'put').mockResolvedValue(csApplied.id);

        await expect(service.applyOutgoingChangesets()).rejects.toThrow('apply failed');

        expect(stateApplySpy).toHaveBeenCalled();
        // db.put should still be executed in the finally block
        expect(dbPutSpy).toHaveBeenCalledWith(csApplied);
      });
    });
  });

  describe('conflict handling', () => {
    describe('_setErrorChangeset', () => {
      it('_setErrorChangeset returns early when not inconsistent or no errorChangeset', () => {
        service.conflictDetails.set({});

        service._setErrorChangeset(null, false);

        expect(service.inconsistent()).toBe(false);
        expect(service.conflictDetails()).toBeNull();
      });

      it('_setErrorChangeset performs automerge when there are no conflicts or conflictTakeOur=true', () => {
        const errorCs: IZsChangeset = getErrorChangeset();
        const conflictDetails: IZsChangesetConflictDetails = {
          changeset: errorCs,
          hasConflicts: false,
          conflicts: [],
          meta: [],
          metaConflict: false,
        };

        stateMock.getErrorChangesetConflicts.mockReturnValueOnce(conflictDetails);

        const replaceSpy = vi.spyOn(service, 'replaceErrorChangesetByMerge');

        service._setErrorChangeset(errorCs, true);

        expect(replaceSpy).toHaveBeenCalledWith(conflictDetails, true);
      });

      it('_setErrorChangeset sets conflictDetails for manual resolution when automerge is not possible', () => {
        const errorCs: IZsChangeset = getErrorChangeset();
        const conflictDetails: IZsChangesetConflictDetails = {
          changeset: errorCs,
          hasConflicts: true,
          conflicts: [/*content not relevant for this check*/],
          meta: [],
          metaConflict: false,
        };

        service.changesetConfig.set({
          hiddenMode: true,
          automerge: true,
          conflictTakeOur: false,
          applyOnExpertViewOnly: false,
        });
        stateMock.getErrorChangesetConflicts.mockReturnValueOnce(conflictDetails);

        const replaceSpy = vi.spyOn(service, 'replaceErrorChangesetByMerge');

        service._setErrorChangeset(errorCs, true);

        expect(replaceSpy).not.toHaveBeenCalled();
        expect(service.conflictDetails()).toBe(conflictDetails);
      });

      it('_setErrorChangeset resets merging when there are no outgoing changesets left', () => {
        service.merging.set({ current: 2, count: 3 });
        service.outgoingCount.set(0);

        service._setErrorChangeset(null, false);

        expect(service.merging()).toBeNull();
      });
    });

    describe('getChanges', () => {
      it('returns the diff of orig vs our values for a changed element', () => {
        const changeset = getChangeset2();
        const mapState = getBaseMapState();

        const result = service.getChanges(changeset, mapState);

        expect(result).toHaveLength(1);
        expect(result[0].drawElementId).toBe('e1');
        expect(result[0].values).toContainEqual({ path: 'ourChanged', orig: 'z', our: 'change' });
        expect(result[0].values).toContainEqual({ path: 'ourRemoved', orig: 'old2', our: null });
        expect(result[0].values).toContainEqual({ path: 'ourAdded', orig: NO_CONFLICT_VALUE, our: 'new' });
      });

      it('skips an element when it no longer exists and has no relevant changes', () => {
        const changeset: IZsChangeset = {
          ...changesetDefaultValues,
          drawElementsLastChangeset: { e1: INITIAL_CHANGESET_ID },
          changedDrawElements: ['e1'],
          deletedDrawElements: [],
          id: 'cs-deleted',
          patches: [],
          inversePatches: [],
          parentChangesetId: INITIAL_CHANGESET_ID,
        };

        const mapState = getEmptyMapState();

        const result = service.getChanges(changeset, mapState);

        expect(result).toEqual([]);
      });

      it('builds a diff against the inverse patches for a newly created element not yet in mapState', () => {
        // element 'e2' was created by this changeset and is not (yet) part of mapState.drawElements,
        // so getChanges must fall back to comparing against changeset.inversePatches instead of mapState.
        const changeset: IZsChangeset = {
          ...changesetDefaultValues,
          drawElementsLastChangeset: { e2: INITIAL_CHANGESET_ID },
          changedDrawElements: ['e2'],
          deletedDrawElements: [],
          id: 'cs-new',
          patches: [{ op: 'add', path: ['drawElements', 'e2'], value: { name: 'New Element' } }],
          inversePatches: [{ op: 'remove', path: ['drawElements', 'e2'] }],
          parentChangesetId: INITIAL_CHANGESET_ID,
        };

        const mapState = getEmptyMapState();

        const result = service.getChanges(changeset, mapState);

        expect(result).toHaveLength(1);
        expect(result[0].drawElementId).toBe('e2');
        // element name/symbolId are read from ourValues when the element isn't (yet) in mapState
        expect(result[0].elementName).toBe('New Element');
        expect(result[0].values).toContainEqual({ path: 'name', orig: NO_CONFLICT_VALUE, our: 'New Element' });
      });

      it('falls back to the sign default values when a newly created signed element has no orig data at all', () => {
        const changeset: IZsChangeset = {
          ...changesetDefaultValues,
          drawElementsLastChangeset: { e3: INITIAL_CHANGESET_ID },
          changedDrawElements: ['e3'],
          deletedDrawElements: [],
          id: 'cs-new-signed',
          patches: [
            {
              op: 'add',
              path: ['drawElements', 'e3'],
              value: {
                //unchanged (matches the sign's own default values -> not part of the diff)
                symbolId: 72,
                type: ZsMapDrawElementStateType.SYMBOL,
                color: '#0000FF',
                style: 'solid',
                labelShow: true,
                iconOpacity: 0.5,
                //changed (differs from the sign's default values)
                iconSize: 1.5,
                rotation: 90,
                //added (no default value at all for these -> orig is NO_CONFLICT_VALUE)
                name: 'KP Schadenplatz 1',
                reportNumber: [1],
                description: 'some description',
              },
            },
          ],
          inversePatches: [],
          parentChangesetId: INITIAL_CHANGESET_ID,
        };

        const mapState = getEmptyMapState();

        const result = service.getChanges(changeset, mapState);

        expect(result).toHaveLength(1);
        expect(result[0].drawElementId).toBe('e3');
        expect(result[0].values).toEqual([
          { path: 'iconSize', orig: 1, our: 1.5 },
          { path: 'rotation', orig: 1, our: 90 },
          { path: 'name', orig: NO_CONFLICT_VALUE, our: 'KP Schadenplatz 1' },
          { path: 'reportNumber', orig: NO_CONFLICT_VALUE, our: [1] },
          { path: 'description', orig: NO_CONFLICT_VALUE, our: 'some description' },
        ]);
      });
    });

    describe('_getChangedMetaValues', () => {
      it('ignores draw element patches', () => {
        const patches: Patch[] = [
          {
            op: 'replace',
            path: ['drawElements', 'e1', 'name'],
            value: 'Element',
          },
          {
            op: 'replace',
            path: ['name'],
            value: 'Map name',
          },
        ];

        const result = service._getChangedMetaValues(patches);

        expect(result).toEqual({
          name: 'Map name',
        });
      });

      it('flattens nested object values', () => {
        const patches: Patch[] = [
          {
            op: 'replace',
            path: ['settings'],
            value: {
              color: 'red',
              visibility: {
                enabled: true,
              },
            },
          },
        ];

        const result = service._getChangedMetaValues(patches);

        expect(result).toEqual({
          'settings.color': 'red',
          'settings.visibility.enabled': true,
        });
      });

      it('represents removed values as null', () => {
        const patches: Patch[] = [
          {
            op: 'replace',
            path: ['settings', 'color'],
            value: 'red',
          },
          {
            op: 'replace',
            path: ['settings', 'size'],
            value: 10,
          },
          {
            op: 'remove',
            path: ['settings'],
          },
        ];

        const result = service._getChangedMetaValues(patches);

        expect(result).toEqual({
          settings: null,
        });
      });

      it('processes multiple meta patches in order', () => {
        const patches: Patch[] = [
          {
            op: 'replace',
            path: ['title'],
            value: 'Initial',
          },
          {
            op: 'replace',
            path: ['title'],
            value: 'Changed',
          },
          {
            op: 'add',
            path: ['author'],
            value: 'Alice',
          },
        ];

        const result = service._getChangedMetaValues(patches);

        expect(result).toEqual({
          title: 'Changed',
          author: 'Alice',
        });
      });
    });

    describe('_saveThereElements', () => {
      it('throws if operation changesets are missing', () => {
        sessionMock.getOperation.mockReturnValue(undefined);

        const changeset = getErrorChangeset();

        expect(() => service._saveThereElements(getLocalMapState(), changeset)).toThrow(ChangesetMissingError);

        expect(sessionMock.getOperation).toHaveBeenCalled();
      });

      it('finds additional changesets', () => {
        const changeset = getErrorChangeset();

        setOperationChangesets({
          c0: getChangeset0(),
          c1: getChangeset1(),
          c2: changeset,
        });

        const mapState = getMapStateFor(thereElement, [CHANGESET_ID_0, CHANGESET_ID_1]);

        const result = service._saveThereElements(mapState, changeset);

        expect(result.totalAdditionalChangesets).toEqual(new Set([CHANGESET_ID_1]));

        expect(result.totalThereChangedElements).toEqual(new Set(['e1']));

        expect(changeset.mergeConflictChangesetIds).toEqual([CHANGESET_ID_1]);
      });

      it('copies the current there element', () => {
        const changeset = getErrorChangeset({
          drawElementsLastChangeset: {
            e1: CHANGESET_ID_0,
          },
          changedDrawElements: ['e1'],
          baseMapState: getBaseMapState(),
        });

        setOperationChangesets({
          c0: getChangeset0(),
          c1: getChangeset1(),
          c2: changeset,
        });

        const mapState = getMapStateFor(thereElement, [CHANGESET_ID_0, CHANGESET_ID_1]);

        service._saveThereElements(mapState, changeset);

        expect(changeset.thereDrawElements?.['e1']).toEqual(populateDeepParamInElement(thereElement));

        expect(changeset.thereDrawElements?.['e1']).not.toBe(mapState.drawElements['e1']);
      });

      it('copies the original element from baseMapState', () => {
        const changeset = getErrorChangeset();

        setOperationChangesets({
          c0: getChangeset0(),
          c1: getChangeset1(),
          c2: changeset,
        });

        const mapState = getMapStateFor(thereElement, [CHANGESET_ID_0, CHANGESET_ID_1]);

        service._saveThereElements(mapState, changeset);

        expect(changeset.origDrawElements?.['e1']).toEqual(populateDeepParamInElement(origElement));

        expect(changeset.origDrawElements?.['e1']).not.toBe(changeset.baseMapState?.drawElements['e1']);
      });
      it('throws ChangesetMissingError for an unknown additional changeset', () => {
        const changeset = getErrorChangeset();

        setOperationChangesets({
          c0: getChangeset0(),
          c2: changeset,
        });

        const mapState = getMapStateFor(thereElement, [CHANGESET_ID_0, 'missing']);

        expect(() => service._saveThereElements(mapState, changeset)).toThrow(ChangesetMissingError);
      });
    });

    describe('_getChangedValuesForElem', () => {
      it('returns only changes for the requested element', () => {
        const patches: Patch[] = [
          ...patchesOur,
          {
            op: 'replace',
            path: ['drawElements', 'e2', 'name'],
            value: 'Other element',
          },
          {
            op: 'replace',
            path: ['title'],
            value: 'Map',
          },
        ];

        const result = service._getChangedValuesForElem(patches, 'e1');

        expect(result).toEqual(ourDeltaElement);
      });

      it('flattens nested values', () => {
        const result = service._getChangedValuesForElem(patchesKeeped, 'e1');

        expect(result).toMatchObject({
          ourChanged: 'change',
          'our.changed.deep': 'change',
          ourAdded: 'new',
        });
      });

      it('handles remove operations as null', () => {
        const result = service._getChangedValuesForElem(
          [
            {
              op: 'replace',
              path: ['drawElements', 'e1', 'foo', 'bar'],
              value: 'value',
            },
            {
              op: 'remove',
              path: ['drawElements', 'e1', 'foo'],
            },
          ],
          'e1',
        );

        expect(result).toEqual({
          foo: null,
        });
      });

      it('returns an empty object for another element', () => {
        const result = service._getChangedValuesForElem(patchesOur, 'e2');

        expect(result).toEqual({});
      });

      it('returns an empty object for non-draw-element patches', () => {
        const result = service._getChangedValuesForElem(
          [
            {
              op: 'replace',
              path: ['title'],
              value: 'Map',
            },
          ],
          'e1',
        );

        expect(result).toEqual({});
      });

      it('keeps coordinates as one value', () => {
        const coordinates = [
          [1, 2],
          [3, 4],
        ];

        const result = service._getChangedValuesForElem(
          [
            {
              op: 'replace',
              path: ['drawElements', 'e1', 'coordinates'],
              value: coordinates,
            },
          ],
          'e1',
        );

        expect(result).toEqual({
          coordinates,
        });
      });

      it('keeps reportNumber as one value', () => {
        const reportNumber = [1, 2, 5];

        const result = service._getChangedValuesForElem(
          [
            {
              op: 'replace',
              path: ['drawElements', 'e1', 'reportNumber'],
              value: reportNumber,
            },
          ],
          'e1',
        );

        expect(result).toEqual({
          reportNumber,
        });
      });
    });

    describe('_getElementFromCachedElements', () => {
      const orig = { name: 'orig' };
      const there = { name: 'there' };
      const our = { name: 'our' };
      const merged = { name: 'merged' };

      const changeset = {
        origDrawElements: { e1: orig },
        thereDrawElements: { e1: there },
        ourDrawElements: { e1: our },
        mergedDrawElements: { e1: merged },
      } as any;

      it.each([
        [0, orig],
        [1, there],
        [2, our],
        [3, merged],
      ])('returns the cached element for index %i', (index, expected) => {
        const result = service._getElementFromCachedElements(changeset, 'e1', index);

        expect(result).toEqual(expected);
      });

      it('returns null for an unknown index', () => {
        const result = service._getElementFromCachedElements(changeset, 'e1', 99);

        expect(result).toBeNull();
      });

      it('returns null if the requested element is not cached', () => {
        const result = service._getElementFromCachedElements(changeset, 'missing', 0);

        expect(result).toBeNull();
      });

      it('returns null if the corresponding cache is missing', () => {
        const result = service._getElementFromCachedElements(
          {
            origDrawElements: {},
          },
          'e1',
          1,
        );

        expect(result).toBeNull();
      });

      it('returns a clone instead of the cached object', () => {
        const result = service._getElementFromCachedElements(changeset, 'e1', 0);

        expect(result).toEqual(orig as any);
        expect(result).not.toBe(orig as any);
      });

      it('deep-clones nested elements', () => {
        const nested = {
          nested: {
            value: 'original',
          },
        };

        const result = service._getElementFromCachedElements(
          {
            origDrawElements: {
              e1: nested,
            },
          },
          'e1',
          0,
        );

        (result as any).nested.value = 'changed';

        expect(nested.nested.value).toBe('original');
      });
    });

    describe('getErrorChangesetConflicts', () => {
      it('returns null if there is no error changeset', () => {
        vi.spyOn(service, 'errorChangeset').mockReturnValue(null);

        const result = service.getErrorChangesetConflicts(getLocalMapState());

        expect(result).toBeNull();
        expect(sessionMock.getOperation).not.toHaveBeenCalled();
      });

      it('throws if operation is missing', () => {
        const changeset = getErrorChangeset();

        vi.spyOn(service, 'errorChangeset').mockReturnValue(changeset);

        sessionMock.getOperation.mockReturnValue(undefined);

        expect(() => service.getErrorChangesetConflicts(getLocalMapState())).toThrow(ChangesetMissingError);

        expect(sessionMock.getOperation).toHaveBeenCalled();
      });

      it('throws if changeset is applied but not stashed', () => {
        const changeset = getErrorChangeset({
          stashed: false,
          applied: true,
        });

        vi.spyOn(service, 'errorChangeset').mockReturnValue(changeset);

        setOperationChangesets({
          c0: getChangeset0(),
          c2: changeset,
        });

        expect(() => service.getErrorChangesetConflicts(getLocalMapState())).toThrow(
          'changeset need to be stashed for logik to work.',
        );
      });
      it('detects conflicts using the changesets from session.getOperation()', () => {
        const errorChangeset = getErrorChangeset();

        const remoteChangeset = getChangeset1();

        setOperationChangesets({
          c0: getChangeset0(),
          c1: remoteChangeset,
          c2: errorChangeset,
        });

        vi.spyOn(service, 'errorChangeset').mockReturnValue(errorChangeset);

        const mapState = getRemoteMapState();

        const result = service.getErrorChangesetConflicts(mapState);

        expect(result).toEqual(
          expect.objectContaining({
            changeset: errorChangeset,
            conflicts: expect.any(Array),
            meta: expect.any(Array),
            metaConflict: expect.any(Boolean),
            hasConflicts: expect.any(Boolean),
          }),
        );

        expect(sessionMock.getOperation).toHaveBeenCalled();

        const elementConflict = result!.conflicts.find((conflict) => conflict.drawElementId === 'e1');

        expect(elementConflict).toEqual(
          expect.objectContaining({
            drawElementId: 'e1',
            requiredPrefChangesetId: CHANGESET_ID_0,
            additionalChangesets: [CHANGESET_ID_1],
            missing: expect.any(Object),
            values: expect.any(Array),
            conflict: expect.any(Boolean),
          }),
        );
        expect(result!.hasConflicts).toBe(true);

        expect(sortByPath(elementConflict?.values ?? [])).toEqual(conflictValuesSorted);
      });
      it('returns an element conflict without additional changesets', () => {
        const errorChangeset = getErrorChangeset({
          id: CHANGESET_ID_2,
          patches: patchesOur,
          inversePatches: reversePatchesOur,
          drawElementsLastChangeset: {
            e1: CHANGESET_ID_0,
          },
          changedDrawElements: ['e1'],
          baseMapState: getBaseMapState(),
        });

        setOperationChangesets({
          c0: getChangeset0(),
          c2: errorChangeset,
        });

        vi.spyOn(service, 'errorChangeset').mockReturnValue(errorChangeset);

        const mapState = getMapStateFor(origElement, [CHANGESET_ID_0]);

        vi.spyOn(service, 'stashChangeset').mockReturnValue(mapState);

        const result = service.getErrorChangesetConflicts(mapState);

        const conflict = result!.conflicts.find((item) => item.drawElementId === 'e1');

        expect(conflict).toBeDefined();
        expect(conflict!.additionalChangesets).toEqual([]);
      });

      it('recovers via baseMapState when drawElementsLastChangeset no longer exists on mapState', () => {
        // simulates an outgoing change that became empty after a merge and was therefore
        // removed from the changeset stack: mapState no longer knows about it directly,
        // but baseMapState still has a usable last-known changesetId to fall back to.
        const errorChangeset = getErrorChangeset({
          drawElementsLastChangeset: { e1: 'stale-cs' },
        });
        const remoteChangeset = getChangeset1();

        setOperationChangesets({
          c0: getChangeset0(),
          c1: remoteChangeset,
          c2: errorChangeset,
        });

        vi.spyOn(service, 'errorChangeset').mockReturnValue(errorChangeset);

        const mapState = getRemoteMapState();

        const result = service.getErrorChangesetConflicts(mapState);

        const elementConflict = result!.conflicts.find((conflict) => conflict.drawElementId === 'e1');

        expect(elementConflict).toBeDefined();
        // recovered from baseMapState's last known id (CHANGESET_ID_0) -> everything after it is additional
        expect(elementConflict!.requiredPrefChangesetId).toBe(CHANGESET_ID_0);
        expect(elementConflict!.additionalChangesets).toEqual([CHANGESET_ID_1]);
      });

      it('treats the element as untracked when mapState has no changeset history for it', () => {
        const errorChangeset = getErrorChangeset(); // patches: patchesOur, inversePatches: reversePatchesOur, origDrawElements: {}

        setOperationChangesets({
          c2: errorChangeset,
        });

        vi.spyOn(service, 'errorChangeset').mockReturnValue(errorChangeset);

        // e1 has no entry in drawElementChangesetIds at all -> changesetIds is undefined from the start
        const mapState: ZsMapState = { ...getBaseMapState(), drawElementChangesetIds: {} };

        const result = service.getErrorChangesetConflicts(mapState);

        const elementConflict = result!.conflicts.find((conflict) => conflict.drawElementId === 'e1');

        expect(elementConflict).toBeDefined();
        expect(elementConflict!.additionalChangesets).toEqual([]);
        expect(elementConflict!.missing.there).toBe(true);
        // no origDrawElements['e1'] on the fixture -> orig values come from the inverse patches
        expect(elementConflict!.values).toContainEqual({
          path: 'ourChanged',
          orig: 'z',
          there: NO_CONFLICT_VALUE,
          our: 'change',
          conflict: false,
          selected: OUR_INDEX,
          resolved: false,
        });
      });
    });

    it('cloneElements deep clones existing and nulls missing', () => {
      const mapState: ZsMapState = {
        ...getEmptyMapState(),
        drawElements: { e1: { id: 'e1', data: { nested: 42 } } as any },
      };
      const result = service.cloneElements(mapState, ['e1', 'e2']);

      expect(result['e1']).toEqual(mapState.drawElements['e1']);
      expect(result['e1']).not.toBe(mapState.drawElements['e1']); // deep clone
      expect(result['e2']).toBeNull();
    });

    it('_getOrigValues extracts nested paths', () => {
      const element: any = { a: { b: { c: 42 } }, meta: { title: 'test' } };
      const result = service._getOrigValues(element, new Set(['a.b.c', 'meta.title']));

      expect(result['a.b.c']).toBe(42);
      expect(result['meta.title']).toBe('test');
    });

    it('_mergeConflictValues detects conflicts and select correctly', () => {
      //prepare values for call
      const ourValues = service._getChangedValuesForElem(patchesOur, 'e1');
      const thereValues = service._getChangedValuesForElem(patchesThere, 'e1');
      const valuePaths = new Set<string>();
      Object.keys(ourValues).forEach((path) => {
        valuePaths.add(path);
      });
      Object.keys(thereValues).forEach((path) => {
        valuePaths.add(path);
      });
      const origValues = service._getOrigValues(origElement as any, valuePaths);

      const merged = service._mergeConflictValues(origValues, ourValues, thereValues);

      const selected0 = merged.filter((m: any) => m.selected === 0).map((m: any) => m.path); //orig
      const selected1 = merged.filter((m: any) => m.selected === 1).map((m: any) => m.path); //there
      const selected2 = merged.filter((m: any) => m.selected === 2).map((m: any) => m.path); //our
      const selected3 = merged.filter((m: any) => m.selected === 3).map((m: any) => m.path); //undefined/conflict
      const conflicPaths = merged.filter((m: any) => m.conflict).map((m: any) => m.path);

      expect(selected0).toHaveLength(0);

      expect(selected1).toContain('thereAdded');
      expect(selected1).toContain('thereChanged');
      expect(selected1).toContain('thereRemoved');
      expect(selected1).toHaveLength(3);

      //expect(selected2).toContain('same');
      expect(selected2).toContain('ourChanged');
      expect(selected2).toContain('our.changed.deep');
      expect(selected2).toContain('ourAdded');
      expect(selected2).toContain('ourRemoved');
      expect(selected2).toContain('bothRemoved');
      expect(selected2).toContain('bothChangedSame');
      expect(selected2).toContain('bothAddedSame');
      expect(selected2).toHaveLength(7);

      expect(selected3).toContain('bothChanged');
      expect(selected3).toContain('ourRemovedThereChanged');
      expect(selected3).toContain('ourChangedThereRemoved');
      expect(selected3).toContain('bothAddedDifferent');
      expect(selected3).toHaveLength(4);

      expect(conflicPaths).toContain('bothChanged');
      expect(conflicPaths).toContain('ourRemovedThereChanged');
      expect(conflicPaths).toContain('ourChangedThereRemoved');
      expect(conflicPaths).toContain('bothAddedDifferent');
      expect(conflicPaths).toHaveLength(4);
    });

    it('openChangesetMergeView opens sidebar and sets merge mode', () => {
      vi.spyOn(service, '_addAllConflictElements');

      service.openChangesetMergeView();

      expect(stateMock.setChangesetMergeMode).toHaveBeenCalled();
      expect(sidebarMock.open).toHaveBeenCalled();
    });

    it('updateConflictValue sets nested properties', () => {
      const draft: any = {};
      const value: any = { orig: 1, there: 2, our: 3 };

      service.updateConflictValue(draft, ['meta', 'info', 'key'], value, 2);

      expect(draft.meta.info.key).toBe(3);
    });

    describe('removeConflictValue', () => {
      it('deletes a top-level key', () => {
        const draft: any = { key: 'value', other: 'keep' };

        service.removeConflictValue(draft, ['key']);

        expect(draft).toEqual({ other: 'keep' });
      });

      it('deletes a nested key', () => {
        const draft: any = { meta: { info: { key: 'value', other: 'keep' } } };

        service.removeConflictValue(draft, ['meta', 'info', 'key']);

        expect(draft.meta.info).toEqual({ other: 'keep' });
      });

      it('does nothing when an intermediate path segment does not exist', () => {
        const draft: any = { meta: {} };

        expect(() => service.removeConflictValue(draft, ['meta', 'info', 'key'])).not.toThrow();
        expect(draft).toEqual({ meta: {} });
      });
    });

    it('_isArrayKey detects numeric keys', () => {
      expect(service._isArrayKey('0')).toBe(true);
      expect(service._isArrayKey('10')).toBe(true);
      expect(service._isArrayKey('abc')).toBe(false);
      expect(service._isArrayKey('')).toBe(false);
    });

    it('_addAllConflictElements and _removeAllConflictElements add and remove conflict elements', () => {
      const cs: IZsChangesetInternal = {
        ...getErrorChangeset(),
        origDrawElements: { e1: { id: 'e1', layer: 'L1' } as any },
        thereDrawElements: { e1: { id: 'e1', layer: 'L1' } as any },
        ourDrawElements: { e1: { id: 'e1', layer: 'L1' } as any },
        mergedDrawElements: { e1: { id: 'e1', layer: 'L1' } as any },
        deletedDrawElements: [],
      };
      service.errorChangeset.set(cs);

      const mapState: ZsMapState = {
        ...getMapStateDefaults(),
        changesetIds: [INITIAL_CHANGESET_ID],
        drawElements: {
          e1: { id: 'e1', layer: 'L1' } as any,
        },
        drawElementChangesetIds: {},
      };

      stateMock.updateMapState.mockImplementation((fn: any) => {
        fn(mapState);
      });

      service._addAllConflictElements();
      expect(Object.keys(mapState.drawElements).some((id) => id.startsWith('conflict-'))).toBe(true);

      service._removeAllConflictElements();
      expect(Object.keys(mapState.drawElements).every((id) => !id.startsWith('conflict-'))).toBe(true);
    });

    describe('replaceErrorChangesetByMerge', () => {
      it('replaceErrorChangesetByMerge returns early when no errorChangeset', async () => {
        service.errorChangeset.set(null);

        const submitSpy = vi.spyOn(service, '_submitChangeset');
        const updateOutgoingSpy = vi.spyOn(service, 'updateOutgoing');

        await service.replaceErrorChangesetByMerge({} as any, true);

        expect(submitSpy).not.toHaveBeenCalled();
        expect(updateOutgoingSpy).not.toHaveBeenCalled();
      });

      it('replaceErrorChangesetByMerge cancels empty changeset', async () => {
        const cs: IZsChangesetInternal = {
          ...getChangeset2(),
          patches: [],
          inversePatches: [],
          currentMapState: getRemoteMapState(),
          saved: false,
        };
        service.errorChangeset.set(cs);

        //mock functions/signals not part of this test:
        vi.spyOn(service, '_setErrorChangeset').mockImplementation(() => {});
        vi.spyOn(service, '_removeAllConflictElements').mockImplementation(() => {});
        vi.spyOn(service, '_submitChangeset').mockResolvedValue(undefined);
        service.current.set(cs);

        const updateOutgoingSpy = vi.spyOn(service, 'updateOutgoing').mockResolvedValue(undefined);
        const setErrorChangesetSpy = vi.spyOn(service, '_setErrorChangeset');
        const setMergeModeSpy = vi.spyOn(stateMock, 'setChangesetMergeMode');

        await service.replaceErrorChangesetByMerge({ meta: [], conflicts: [] } as any, true);

        expect(updateOutgoingSpy).toHaveBeenCalledWith(cs, true);
        expect(setErrorChangesetSpy).toHaveBeenCalledWith(null, false);
        expect(service.current()).toBeNull();
        expect(setMergeModeSpy).not.toHaveBeenCalled();
      });

      it('replaceErrorChangesetByMerge submits non-empty changeset', async () => {
        const patchesMeta = [{ op: 'add', path: ['someMeta'], value: 'newMeta' }];
        const resultPatches = [...patchesKeeped, ...patchesAdded, ...patchesMeta];

        const cs = {
          ...getChangeset2(),
          currentMapState: getRemoteMapState(), //incomming applied mapState
          saved: false,
          stashed: true,
        };
        service.errorChangeset.set(cs);

        //prepare values for call
        const ourValues = service._getChangedValuesForElem(patchesOur, 'e1');
        const thereValues = service._getChangedValuesForElem(patchesThere, 'e1');
        const valuePaths = new Set<string>();
        Object.keys(ourValues).forEach((path) => {
          valuePaths.add(path);
        });
        Object.keys(thereValues).forEach((path) => {
          valuePaths.add(path);
        });
        const origValues = service._getOrigValues(origElement as any, valuePaths);

        const values = service._mergeConflictValues(origValues, ourValues, thereValues);

        const conflictDetails: IZsChangesetConflictDetails = {
          changeset: cs,
          meta: [
            {
              path: 'someMeta',
              selected: 3,
              conflict: true,
              resolved: false,
              orig: 'oldMeta',
              there: 'theirMeta',
              our: 'newMeta',
            },
          ],
          conflicts: [
            {
              drawElementId: 'e1',
              missing: { orig: false, there: false, our: false },
              requiredPrefChangesetId: CHANGESET_ID_0,
              additionalChangesets: [''],
              values,
              conflict: true,
            },
          ],
          metaConflict: true,
          hasConflicts: true,
        };

        //mock functions/signals not part of this test:
        vi.spyOn(service, '_setErrorChangeset').mockImplementation(() => {});
        vi.spyOn(service, '_removeAllConflictElements').mockImplementation(() => {});
        vi.spyOn(service, '_submitChangeset').mockResolvedValue(undefined);
        service.current.set(cs);

        const submitOutgoingSpy = vi.spyOn(service, 'submitOutgoing').mockResolvedValue(undefined);
        const setErrorChangesetSpy = vi.spyOn(service, '_setErrorChangeset');
        const setMergeModeSpy = vi.spyOn(stateMock, 'setChangesetMergeMode');

        await service.replaceErrorChangesetByMerge(conflictDetails, true);

        expect(submitOutgoingSpy).toHaveBeenCalled();
        expect(setErrorChangesetSpy).toHaveBeenCalledWith(null, false);
        expect(setMergeModeSpy).toHaveBeenCalledWith(false);

        //verify result
        patchesReverted.forEach((item) => {
          expect(cs.patchesRevertedForMerge).toContainEqual(item);
        });
        expect(cs.patchesRevertedForMerge).toHaveLength(patchesReverted.length);
        resultPatches.forEach((item) => {
          expect(cs.patches).toContainEqual(item);
        });
        expect(cs.patches).toHaveLength(resultPatches.length);
      });

      it('restores a deleted element from cached "our" elements before applying value changes', async () => {
        const cs: IZsChangesetInternal = {
          ...getChangeset2(),
          // element e1 was deleted remotely -> not present in the incoming-applied state anymore
          currentMapState: { ...getRemoteMapState(), drawElements: {} },
          saved: false,
          stashed: true,
          ourDrawElements: { e1: { id: 'e1', name: 'cached-name' } as any },
        };
        service.errorChangeset.set(cs);

        const conflictDetails = getThereMissingNoConflictConflictDetails(cs);

        //mock functions/signals not part of this test:
        vi.spyOn(service, '_setErrorChangeset').mockImplementation(() => {});
        vi.spyOn(service, '_removeAllConflictElements').mockImplementation(() => {});
        vi.spyOn(service, '_submitChangeset').mockResolvedValue(undefined);
        service.current.set(cs);

        vi.spyOn(service, 'submitOutgoing').mockResolvedValue(undefined);
        vi.spyOn(stateMock, 'setChangesetMergeMode');

        await service.replaceErrorChangesetByMerge(conflictDetails, true);

        // element must be re-created from the cached 'our' copy, then updated with the resolved value
        expect(cs.patches).toContainEqual(
          expect.objectContaining({
            op: 'add',
            path: ['drawElements', 'e1'],
            value: expect.objectContaining({ id: 'e1', name: 'updated-name' }),
          }),
        );
      });

      it('skips a deleted element in hiddenMode when it cannot be restored from any cache', async () => {
        const cs: IZsChangesetInternal = {
          ...getChangeset2(),
          currentMapState: { ...getRemoteMapState(), drawElements: {} },
          saved: false,
          stashed: true,
          // no origDrawElements/thereDrawElements/ourDrawElements/mergedDrawElements for e1 at all
        };
        service.errorChangeset.set(cs);

        service.changesetConfig.set({
          hiddenMode: true,
          automerge: true,
          conflictTakeOur: true,
          applyOnExpertViewOnly: false,
        });

        const conflictDetails = getThereMissingNoConflictConflictDetails(cs);

        //mock functions/signals not part of this test:
        vi.spyOn(service, '_setErrorChangeset').mockImplementation(() => {});
        vi.spyOn(service, '_removeAllConflictElements').mockImplementation(() => {});
        vi.spyOn(service, '_submitChangeset').mockResolvedValue(undefined);
        service.current.set(cs);

        vi.spyOn(service, 'submitOutgoing').mockResolvedValue(undefined);
        vi.spyOn(stateMock, 'setChangesetMergeMode');

        await expect(service.replaceErrorChangesetByMerge(conflictDetails, true)).resolves.not.toThrow();

        // the unrestorable element is silently skipped, not (re-)added to the patches
        expect(cs.patches.some((p: any) => p.path[1] === 'e1')).toBe(false);
      });

      it('throws when a deleted element cannot be restored and hiddenMode is off', async () => {
        const cs: IZsChangesetInternal = {
          ...getChangeset2(),
          currentMapState: { ...getRemoteMapState(), drawElements: {} },
          saved: false,
          stashed: true,
        };
        service.errorChangeset.set(cs);

        service.changesetConfig.set({
          hiddenMode: false,
          automerge: true,
          conflictTakeOur: true,
          applyOnExpertViewOnly: false,
        });

        const conflictDetails = getThereMissingNoConflictConflictDetails(cs);

        vi.spyOn(service, '_setErrorChangeset').mockImplementation(() => {});
        vi.spyOn(service, '_removeAllConflictElements').mockImplementation(() => {});
        vi.spyOn(service, '_submitChangeset').mockResolvedValue(undefined);
        service.current.set(cs);

        vi.spyOn(service, 'submitOutgoing').mockResolvedValue(undefined);
        vi.spyOn(stateMock, 'setChangesetMergeMode');

        await expect(service.replaceErrorChangesetByMerge(conflictDetails, true)).rejects.toThrow(
          'unable to restore deleted element: e1',
        );
      });
    });
  });

  describe('handleUnhandledPatches', () => {
    it('handleUnhandledPatches processes queued newChangesets', async () => {
      vi.spyOn(service, 'newChangeset');
      service.unhandledPatches.set([{ newChangeset: true, messageNumber: 1 }]);

      await service.handleUnhandledPatches();

      expect(service.newChangeset).toHaveBeenCalled();
      expect(service.unhandledPatches().length).toBe(0);
    });

    it('handleUnhandledPatches restores the queue on error', async () => {
      const patchesEntry = { patches: [], inversePatches: [], timestamp: Date.now() };

      service.unhandledPatches.set([patchesEntry]);

      const addChangeSpy = vi.spyOn(service, 'addChange').mockRejectedValueOnce(new Error('fail'));

      await expect(service.handleUnhandledPatches()).rejects.toThrow();

      // entry is present again
      expect(service.unhandledPatches()).toEqual([patchesEntry]);

      addChangeSpy.mockRestore();
    });
  });

  describe('_verifyUsableChangesetActive', () => {
    it('_verifyUsableChangesetActive creates a new changeset when there is none active', async () => {
      service.current.set(null);

      const newChangesetSpy = vi.spyOn(service, 'newChangeset').mockResolvedValue(getNewChangeset());

      const result = await service._verifyUsableChangesetActive({} as any, [], new Set());

      expect(newChangesetSpy).toHaveBeenCalledWith();
      expect(result.id).toEqual('new-cs');
    });

    it('_verifyUsableChangesetActive creates a new changeset when the current one is already finished', async () => {
      const cs: IZsChangeset = {
        ...getChangeset2(),
        id: 'cs-done',
        endAt: Date.now(),
      };
      service.current.set(cs);

      const newChangesetSpy = vi.spyOn(service, 'newChangeset').mockResolvedValue(getNewChangeset());

      const result = await service._verifyUsableChangesetActive({} as any, [], new Set());

      expect(newChangesetSpy).toHaveBeenCalledWith();
      expect(result.id).toEqual('new-cs');
    });

    it('_verifyUsableChangesetActive reuses the current changeset unchanged for message changesets', async () => {
      const cs: IZsChangeset = {
        ...getChangeset2(),
        id: 'cs-message',
        messageNumber: 1,
        manual: false,
        layer: 'L2', // would normally trigger a new changeset, but message changesets skip that check
      };
      service.current.set(cs);

      const newChangesetSpy = vi.spyOn(service, 'newChangeset');
      const mapState: ZsMapState = {
        ...getEmptyMapState(),
        drawElements: { e2: { id: 'e2', layer: 'L1' } as any },
      };
      const patches: Patch[] = [{ op: 'replace', path: ['drawElements', 'e2', 'x'], value: 1 }];

      const result = await service._verifyUsableChangesetActive(mapState, patches, new Set(['e2']));

      expect(newChangesetSpy).not.toHaveBeenCalled();
      expect(result).toBe(cs);
    });

    it('_verifyUsableChangesetActive reuses the current changeset unchanged for manual changesets', async () => {
      const cs: IZsChangeset = {
        ...getChangeset2(),
        id: 'cs-manual',
        messageNumber: undefined,
        manual: true,
        layer: 'L2', // would normally trigger a new changeset, but manaul changesets skip that check
      };
      service.current.set(cs);

      const newChangesetSpy = vi.spyOn(service, 'newChangeset');
      const mapState: ZsMapState = {
        ...getEmptyMapState(),
        drawElements: { e2: { id: 'e2', layer: 'L1' } as any },
      };
      const patches: Patch[] = [{ op: 'replace', path: ['drawElements', 'e2', 'x'], value: 1 }];

      const result = await service._verifyUsableChangesetActive(mapState, patches, new Set(['e2']));

      expect(newChangesetSpy).not.toHaveBeenCalled();
      expect(result).toBe(cs);
    });

    it('_verifyUsableChangesetActive reuses the current changeset when nothing conflicts', async () => {
      const cs: IZsChangeset = {
        ...getChangeset2(),
        id: 'cs-reuse',
        messageNumber: undefined,
        manual: false,
        layer: 'L1',
      };
      service.current.set(cs);

      const newChangesetSpy = vi.spyOn(service, 'newChangeset');
      const mapState: ZsMapState = {
        ...getEmptyMapState(),
        drawElements: { e1: { id: 'e1', layer: 'L1' } as any },
      };
      const patches: Patch[] = [{ op: 'replace', path: ['drawElements', 'e1', 'x'], value: 1 }];

      // same layer and the only changed element (e1) is also part of modifiedDrawElements -> reuse
      const result = await service._verifyUsableChangesetActive(mapState, patches, new Set(['e1']));

      expect(newChangesetSpy).not.toHaveBeenCalled();
      expect(result).toBe(cs);
    });

    it('_verifyUsableChangesetActive creates a new changeset on layer change', async () => {
      const cs: IZsChangeset = {
        ...getEmptyChangeset(),
        id: 'cs-layer',
        messageNumber: undefined,
        manual: false,
        patches: [],
        inversePatches: [],
        //technically layer is not set if there are no changedDrawElements / patches
        //do it here to prevent 'multi-element' check resulting in newChangeset call
        layer: 'L1',
      };
      service.current.set(cs);

      const mapState: ZsMapState = {
        ...getEmptyMapState(),
        drawElements: {
          e1: { id: 'e1', layer: 'L1' } as any,
          e2: { id: 'e2', layer: 'L2' } as any,
        },
      };
      const patches: Patch[] = [{ op: 'replace', path: ['drawElements', 'e2', 'x'], value: 1 }];

      const modifiedDrawElements = new Set(['e2']);

      const newChangesetSpy = vi.spyOn(service, 'newChangeset').mockResolvedValue(getNewChangeset());

      await service._verifyUsableChangesetActive(mapState, patches, modifiedDrawElements);

      expect(newChangesetSpy).toHaveBeenCalled();
    });

    it('_verifyUsableChangesetActive creates a new changeset when the multi-element delta has expired', async () => {
      const oldTs = Date.now() - 60000; // older than _createMultiElementChangesetDelta
      const cs: IZsChangeset = {
        ...getChangeset2(),
        startAt: oldTs,
        firstChangeAt: oldTs,
        messageNumber: undefined,
        manual: false,
        layer: 'L1',
      };
      service.current.set(cs);

      const mapState: ZsMapState = {
        ...getEmptyMapState(),
        drawElements: {
          e1: { id: 'e1', layer: 'L1' } as any,
          e2: { id: 'e2', layer: 'L1' } as any,
        },
      };

      const patches: Patch[] = [{ op: 'replace', path: ['drawElements', 'e2', 'x'], value: 2 }];
      const modifiedDrawElements = new Set(['e2']);

      // hiddenMode = true
      service.changesetConfig.set({
        hiddenMode: true,
        automerge: true,
        conflictTakeOur: true,
        applyOnExpertViewOnly: false,
      });

      const newChangesetSpy = vi.spyOn(service, 'newChangeset').mockResolvedValue(getNewChangeset());

      await service._verifyUsableChangesetActive(mapState, patches, modifiedDrawElements);

      expect(newChangesetSpy).toHaveBeenCalled();
    });
  });

  describe('current changeset helpers', () => {
    describe('upateCurrent', () => {
      it('merges the given changes into the current changeset', () => {
        service.current.set({ ...getChangeset2(), manual: false });

        service.upateCurrent({ manual: true, description: ['edited'] });

        expect(service.current()).toMatchObject({ id: CHANGESET_ID_2, manual: true, description: ['edited'] });
      });

      it('does nothing when there is no current changeset', () => {
        service.current.set(null);

        service.upateCurrent({ manual: true });

        expect(service.current()).toBeNull();
      });
    });

    describe('markManual', () => {
      it('marks the current changeset as manual and refreshes the timeout', () => {
        service.current.set({ ...getChangeset2(), manual: false });
        const updateTimeoutSpy = vi.spyOn(service, '_updateTimeout');

        service.markManual();

        expect(service.current().manual).toBe(true);
        expect(updateTimeoutSpy).toHaveBeenCalledWith(service.current());
      });
    });

    describe('setManualDescription', () => {
      it('sets the manual description on the current changeset', () => {
        service.current.set({ ...getChangeset2() });

        service.setManualDescription('my custom description');

        expect(service.current().manualDescription).toBe('my custom description');
      });
    });

    describe('stashCurrentChangesetTemporary', () => {
      it('returns mapState unchanged when there is no current changeset', () => {
        service.current.set(null);
        const mapState = getLocalMapState();

        const result = service.stashCurrentChangesetTemporary(mapState);

        expect(result).toBe(mapState);
      });

      it('returns mapState unchanged when the current changeset is already stashed', () => {
        const cs: IZsChangesetInternal = { ...getChangeset2(), stashed: true };
        service.current.set(cs);
        const stashSpy = vi.spyOn(service, 'stashChangeset');
        const mapState = getLocalMapState();

        const result = service.stashCurrentChangesetTemporary(mapState);

        expect(stashSpy).not.toHaveBeenCalled();
        expect(result).toBe(mapState);
      });

      it('removes the current changeset patches from mapState but keeps it marked as not stashed', () => {
        const cs: IZsChangesetInternal = {
          ...getChangeset2(),
          stashed: false,
          parentChangesetId: CHANGESET_ID_0,
        };
        service.current.set(cs);
        const mapState = getLocalMapState();

        const result = service.stashCurrentChangesetTemporary(mapState);

        expect(result).not.toBe(mapState);
        expect(cs.stashed).toBe(true);
      });
    });
  });

  describe('applyChangeset, unapplyChangeset, stash', () => {
    it('applyChangeset throws ChangesetInconsistentError on verify failure', () => {
      const mapState = getEmptyMapState();
      const cs: IZsChangeset = {
        ...getChangeset2(),
        drawElementsLastChangeset: { e1: CHANGESET_ID_1 },
        applied: false,
      };

      expect(() => service.applyChangeset(mapState, cs)).toThrow();
    });

    it('applyChangeset removes colliding patches in hidden mode', () => {
      const mapState: ZsMapState = {
        ...getMapStateDefaults(),
        changesetIds: [CHANGESET_ID_0, CHANGESET_ID_1],
        drawElements: { e1: { x: 0 } as any, e2: { x: 0 } as any },
        drawElementChangesetIds: { e1: ['0', CHANGESET_ID_0], e2: ['0', CHANGESET_ID_1] },
      };

      const current: IZsChangeset = {
        ...changesetDefaultValues,
        id: 'curr',
        patches: [
          { op: 'replace', path: ['drawElements', 'e1', 'x'], value: 1 },
          { op: 'replace', path: ['drawElements', 'e2', 'x'], value: 2 },
        ],
        inversePatches: [
          { op: 'replace', path: ['drawElements', 'e1', 'x'], value: 0 },
          { op: 'replace', path: ['drawElements', 'e2', 'x'], value: 0 },
        ],
        changedDrawElements: ['e1', 'e2'],
        deletedDrawElements: [],
        drawElementsLastChangeset: { e1: CHANGESET_ID_0, e2: CHANGESET_ID_1 },
      };
      service.current.set(current);
      service.changesetConfig.set({
        hiddenMode: true,
        automerge: true,
        conflictTakeOur: true,
        applyOnExpertViewOnly: false,
      });

      const cs: IZsChangeset = {
        ...changesetDefaultValues,
        id: 'incoming',
        patches: [{ op: 'replace', path: ['drawElements', 'e1', 'x'], value: 10 }],
        inversePatches: [{ op: 'replace', path: ['drawElements', 'e1', 'x'], value: 0 }],
        changedDrawElements: ['e1'],
        deletedDrawElements: [],
        drawElementsLastChangeset: { e1: CHANGESET_ID_0, e2: CHANGESET_ID_1 },
      };

      service.applyChangeset(mapState, cs);

      // Patch for e1 should be removed, e2 should be kept
      expect(service.current().patches).toEqual([{ op: 'replace', path: ['drawElements', 'e2', 'x'], value: 2 }]);
      expect(service.current().inversePatches).toEqual([
        { op: 'replace', path: ['drawElements', 'e2', 'x'], value: 0 },
      ]);
    });

    it('applyChangeset marks an already-applied changeset without reapplying its patches', () => {
      const mapState: ZsMapState = {
        ...getEmptyMapState(),
        changesetIds: [INITIAL_CHANGESET_ID, CHANGESET_ID_0, CHANGESET_ID_1],
      };
      const cs: IZsChangeset = {
        ...getChangeset1(),
        applied: false,
      };

      const result = service.applyChangeset(mapState, cs);

      expect(cs.applied).toBe(true);
      expect(result).toBe(mapState);
    });

    it('unapplyChangeset throws ChangesetInconsistentError when verifyChangesetCanUnapply fails', () => {
      //element e1 does not exist on mapstate
      const mapState: ZsMapState = {
        ...getEmptyMapState(),
        changesetIds: [INITIAL_CHANGESET_ID, CHANGESET_ID_0, CHANGESET_ID_1],
      };
      const cs: IZsChangeset = {
        ...getChangeset1(),
        applied: true,
      };

      expect(() => service.unapplyChangeset(mapState, cs)).toThrow(ChangesetInconsistentError);
    });

    it('unapplyChangeset does unapply', () => {
      let mapState = getRemoteMapState();
      const cs: IZsChangeset = {
        ...getChangeset1(),
        applied: false,
      };
      sessionMock.getOperation.mockReturnValueOnce({});

      mapState = service.unapplyChangeset(mapState, cs);
      expect(cs.applied).toBe(false);
      expect(mapState.changesetIds).toEqual([INITIAL_CHANGESET_ID, CHANGESET_ID_0]);
    });

    it('unapplyChangeset marks an already-not-applied changeset without reapplying its inverse patches', () => {
      const mapState: ZsMapState = { ...getEmptyMapState(), changesetIds: [INITIAL_CHANGESET_ID, CHANGESET_ID_0] };
      const cs: IZsChangeset = {
        ...getChangeset1(),
        applied: true,
      };

      const result = service.unapplyChangeset(mapState, cs);

      expect(cs.applied).toBe(false);
      expect(result).toBe(mapState);
    });

    it('stashChangeset throws when mapState not matching parent', () => {
      const cs = getChangeset2();
      const mapState = getRemoteMapState();

      expect(() => service.stashChangeset(mapState, cs, true)).toThrow(
        'cannot stash changeset if mapState is not on corresponding parentChangesetId',
      );
    });

    it('stashChangeset stashes and unstashes with catchErrors', () => {
      const cs: IZsChangesetInternal = {
        ...getChangeset2(),
        stashed: false,
        // inversePatches: [
        //   ...reversePatchesOur,
        //   // invalid patch should be swallowed by catchErrors
        //   { op: 'remove', path: ['invalid'], value: undefined },
        // ],
        inversePatches: [
          { op: 'add', path: ['drawElements', 'e1'], value: { id: 'e1' } },
          // invalid patch should be swallowed by catchErrors
          { op: 'remove', path: ['notExisting'] }, //does not produce error
          { op: 'remove', path: 'invalid' as any }, //invalid path
          { op: 'noop' as any, path: ['invalid'] }, //invalid op
        ],
        patches: [
          { op: 'remove', path: ['drawElements', 'e1'] },
          // invalid patch should be swallowed by catchErrors
          { op: 'noop' as any, path: ['invalid'] }, //invalid op
        ],
      };

      const mapState = getBaseMapState();

      // stash with catchErrors
      const stashedState = service.stashChangeset(mapState, cs, true, true);
      expect(cs.stashed).toBe(true);
      console.log(stashedState);

      // unstash
      const unStashedState = service.stashChangeset(stashedState, cs, false, true);
      expect(cs.stashed).toBe(false);
    });
  });
});
