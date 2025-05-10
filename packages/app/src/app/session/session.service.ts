import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Params, Router } from '@angular/router';
import {
  AccessTokenType,
  DEFAULT_LOCALE,
  IAuthResult,
  IZsMapDisplayState,
  IZsMapOperation,
  IZsMapOrganization,
  IZsMapOrganizationMapLayerSettings,
  IZsMapSession,
  Locale,
  PermissionType,
} from '@zskarte/types';
import { transform } from 'ol/proj';
import {
  BehaviorSubject,
  Observable,
  Subject,
  concatMap,
  distinctUntilChanged,
  filter,
  firstValueFrom,
  map,
  of,
  retry,
  skip,
  switchMap,
  takeUntil,
} from 'rxjs';
import { ApiService } from '../api/api.service';
import { db } from '../db/db';
import { debounceLeading } from '../helper/debounce';
import { decodeJWT } from '../helper/jwt';
import { coordinatesProjection, mercatorProjection } from '../helper/projections';
import { MapLayerService } from '../map-layer/map-layer.service';
import { OrganisationLayerSettingsComponent } from '../map-layer/organisation-layer-settings/organisation-layer-settings.component';
import { WmsService } from '../map-layer/wms/wms.service';
import { ZsMapStateService } from '../state/state.service';
import {
  DEFAULT_COORDINATES,
  DEFAULT_ZOOM,
  LOG2_ZOOM_0_RESOLUTION,
  MAX_DRAW_ELEMENTS_GUEST,
} from './default-map-values';
import { OperationService } from './operations/operation.service';
import { ALLOW_OFFLINE_ACCESS_KEY, GUEST_USER_IDENTIFIER, GUEST_USER_ORG } from './userLogic';
import { BlobService } from '../db/blob.service';
import { BLOB_URL_JOURNAL_ENTRY_TEMPLATE } from '../journal/journal.types';

export type LogoutReason = 'logout' | 'networkError' | 'expired' | 'noToken';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private _router = inject(Router);
  private _api = inject(ApiService);
  private _wms = inject(WmsService);
  private _mapLayerService = inject(MapLayerService);
  private _operationService = inject(OperationService);

  private _session = new BehaviorSubject<IZsMapSession | undefined>(undefined);
  private _clearOperation = new Subject<void>();
  private _state!: ZsMapStateService;
  private _authError = new BehaviorSubject<HttpErrorResponse | undefined>(undefined);
  private _isOnline = new BehaviorSubject<boolean>(true);

  constructor() {
    const _operationService = this._operationService;

    //"solve" circular dependency between OperationService and SessionService
    _operationService.setSessionService(this);

    if (!navigator.onLine) {
      this._isOnline.next(false);
    }

    this._session.pipe(skip(1)).subscribe(async (session) => {
      this._clearOperation.next();
      if (session?.jwt || session?.workLocal) {
        await db.sessions.put(session);
        if (session.operation?.documentId || session.operation?.id) {
          const queryParams = await firstValueFrom(this._router.routerState.root.queryParams);
          await this._router.navigate(
            [
              this._router.url.split('?')[0] === '/main/journal' || queryParams['messageNumber']
                ? '/main/journal'
                : '/main/map',
            ],
            {
              queryParams: {
                center: null, //handled in overrideDisplayStateFromQueryParams
                size: null, //handled in overrideDisplayStateFromQueryParams
                operationId: null, //handled in updateJWT / OperationsComponent
              },
              queryParamsHandling: 'merge',
              preserveFragment: true,
            },
          );
          await this._state?.refreshMapState();
          let displayState = await db.displayStates.get({
            id: session.operation?.documentId,
          });

          if (displayState && (!displayState.version || displayState.layers === undefined)) {
            //ignore invalid/empty saved displayState
            displayState = undefined;
          }
          this._state.setDisplayState(displayState);
          if (queryParams) {
            this._state.updateDisplayState((draft) =>
              SessionService.overrideDisplayStateFromQueryParams(draft, queryParams),
            );
          }

          const globalWmsSources = await this._wms.readGlobalWMSSources(session.organization?.documentId ?? '');
          if (session?.workLocal) {
            const localWmsSources = await MapLayerService.getLocalWmsSources();
            if (globalWmsSources.length > 0) {
              //use local copy if available
              const localWmsIds = localWmsSources.map((s) => s.id);
              const wmsSources = [...localWmsSources, ...globalWmsSources.filter((s) => !localWmsIds.includes(s.id))];
              this._state.setGlobalWmsSources(wmsSources);
            } else {
              this._state.setGlobalWmsSources(localWmsSources);
            }
          } else {
            this._state.setGlobalWmsSources(globalWmsSources);
          }
          const globalMapLayers = await this._mapLayerService.readGlobalMapLayers(
            globalWmsSources,
            session.organization?.documentId ?? '',
          );
          if (session?.workLocal) {
            const localMapLayers = await MapLayerService.getLocalMapLayers();
            if (globalMapLayers.length > 0) {
              //use local copy if available, keep both if different settings
              const mapLayers = [
                ...localMapLayers,
                ...globalMapLayers.filter((l) => {
                  const orig = localMapLayers.find((ll) => ll.fullId === l.fullId);
                  if (!orig) {
                    return true;
                  }
                  return !OrganisationLayerSettingsComponent.sameOptions(orig, l, [
                    'mapStatus',
                    'sourceBlobId',
                    'styleBlobId',
                    'offlineAvailable',
                  ]);
                }),
              ];
              this._state.setGlobalMapLayers(mapLayers);
            } else {
              this._state.setGlobalMapLayers(localMapLayers);
            }
          } else {
            this._state.setGlobalMapLayers(globalMapLayers);
          }
          if (!displayState) {
            if (session.organization?.wms_sources && session.organization?.wms_sources.length > 0) {
              //if no session state, fill default wms sources from organisation settings
              const selectedSources = globalWmsSources.filter(
                (s) => s.id && session.organization?.wms_sources.includes(s.id),
              );
              this._state.setWmsSources(selectedSources);
            } else {
              //if no session state, fill default wms sources from local settings
              const localMapLayerSettings = await MapLayerService.loadLocalMapLayerSettings();
              if (localMapLayerSettings?.wms_sources && localMapLayerSettings?.wms_sources.length > 0) {
                const selectedSources = globalWmsSources.filter(
                  (s) => s.id && localMapLayerSettings?.wms_sources.includes(s.id),
                );
                this._state.setWmsSources(selectedSources);
              }
            }
          }
          if (!displayState && session.operation?.mapLayers) {
            //if no session state, fill mapLayers from operation settings
            this._state.setMapSource(session.operation?.mapLayers.baseLayer);
            /*
            //rehydrate mapLayer informations
            const layers = session.operation?.mapLayers.layerConfigs.map((layer) => {
              if (!layer.source) {
                layer.source = MapLayerService.getMapSource(layer, globalWmsSources);
                //need to adjust IZSMapOperationMapLayers.layerConfigs to: (Partial<MapLayer> & MapLayerSourceApi)[];
                delete layer.wms_source;
                delete layer.custom_source;
              }
              //here need to have "allFeatures$" from SidebarComponent...
              //the corresponding logic need to be extracted to a service if extractMapLayerDiff and rehyrdarte should be used
              const allLayers: MapLayer[] = [];
              const defaultLayer = allLayers.find((g) => g.fullId === layer.fullId);
              return { ...defaultLayer, ...layer } as MapLayer;
            });
            */
            const layers = session.operation?.mapLayers.layerConfigs;
            if (layers) {
              this._state.updateDisplayState((draft) => {
                draft.layers = layers;
              });
            }
          }
          //make sure layerFeature source information are up to date
          this._state.reloadAllMapLayers();

          this._state
            .observeDisplayState()
            .pipe(skip(1), takeUntil(this._clearOperation))
            .subscribe(async (displayState) => {
              if (this._session.value?.operation?.documentId) {
                await db.displayStates.put({
                  ...displayState,
                  id: this._session.value.operation?.documentId,
                });
              }
            });
        } else {
          await this._router.navigate(['operations'], { queryParamsHandling: 'preserve', preserveFragment: true });
          this._state.setMapState(undefined);
          this._state.setDisplayState(undefined);
        }
        return;
      }

      //if no valid login and not work local delete all display states and sessions
      await db.displayStates.clear();
      await db.sessions.clear();
      return;
    });

    // online/offline checks
    window.addEventListener('online', () => {
      this._isOnline.next(true);
    });
    window.addEventListener('offline', () => {
      this._isOnline.next(false);
    });
    window.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.persistMapState();
      }
    });
    window.addEventListener('blur', () => {
      this.persistMapState();
    });
    window.addEventListener('pagehide', () => {
      this.persistMapState();
    });

    this._isOnline
      .asObservable()
      .pipe(skip(1), distinctUntilChanged())
      .subscribe((isOnline) => {
        // feature: show notification that connection was lost
        if (!isOnline) return;
        of([])
          .pipe(
            switchMap(async () => {
              await this.refreshToken();
            }),
            retry({ count: 5, delay: 1000 }),
            takeUntil(this._isOnline.asObservable().pipe(filter((isOnline) => !isOnline))),
          )
          .subscribe({
            complete: () => {
              // feature: show notification that connection was restored
            },
          });
      });
  }

  public persistMapState = debounceLeading(async () => {
    const currentSession = this._session.value;
    if (currentSession?.operation && !this._state.isHistoryMode()) {
      const mapState = await firstValueFrom(this._state.observeMapState());
      if (Object.keys(mapState?.drawElements || {})?.length) {
        currentSession.operation.mapState = mapState;
        //only persist current mapState (to ensure offline state), without call this._session.next() / reload all settings & values
        await db.sessions.put(currentSession);
        return true;
      }
    }
    return false;
  }, 30000);

  private static overrideDisplayStateFromQueryParams(displayState: IZsMapDisplayState, queryParams: Params) {
    if (queryParams['center']) {
      try {
        const mapCenter = queryParams['center'].split(',').map(parseFloat);
        displayState.mapCenter = mapCenter;
      } catch {
        //ignoring invalid center infos
      }
    }
    if (queryParams['size']) {
      try {
        const size = queryParams['size'].split(',').map(parseFloat);
        //use window.inner.. as have no access to map.getSize()
        const xResolution = size[0] / window.innerWidth;
        const yResolution = size[1] / window.innerHeight;
        displayState.mapZoom = LOG2_ZOOM_0_RESOLUTION - Math.log2(Math.max(xResolution, yResolution));
      } catch {
        //ignoring invalid size infos
      }
    }
  }

  public setStateService(state: ZsMapStateService): void {
    this._state = state;
  }

  public getOrganization() {
    return this._session.value?.organization;
  }

  public isGuest() {
    return this.getOrganization()?.name === GUEST_USER_ORG;
  }

  public observeIsGuestElementLimitReached(): Observable<boolean> {
    return this._state.observeDrawElementCount().pipe(map((count) => count >= MAX_DRAW_ELEMENTS_GUEST));
  }

  public getOrganizationLongLat(): [number, number] {
    if (this._session.value?.organization?.mapLongitude && this._session.value?.organization?.mapLatitude) {
      return [this._session.value?.organization?.mapLongitude, this._session.value?.organization?.mapLatitude];
    }
    return [0, 0];
  }

  public observeFavoriteLayers$(): Observable<number[] | undefined> {
    return this._session.pipe(
      concatMap(
        async (session) =>
          session?.organization?.map_layer_favorites ??
          (this.isWorkLocal() ? (await MapLayerService.loadLocalMapLayerSettings())?.map_layer_favorites : undefined),
      ),
    );
  }

  public async saveOrganizationMapLayerSettings(data: IZsMapOrganizationMapLayerSettings) {
    const organization = this.getOrganization();
    if (organization?.documentId) {
      await this._api.put(`/api/organizations/${organization.documentId}/layer-settings`, { data });

      organization.wms_sources = data.wms_sources;
      organization.map_layer_favorites = data.map_layer_favorites;
      //update session object
      const currentSession = this._session.value;
      if (currentSession) {
        currentSession.organization = organization;
        this._session.next(currentSession);
      }
    } else if (this.isWorkLocal()) {
      await MapLayerService.saveLocalMapLayerSettings(data);
      this._session.next(this._session.value);
    }
  }

  public async saveJournalEntryTemplate(data: object | null) {
    const organization = this.getOrganization();
    if (organization?.documentId) {
      const response = await this._api.put(`/api/organizations/${organization.documentId}/journal-entry-template`, {
        data,
      });
      const { error, result } = response;
      if (error || !result) {
        console.error('error on update JournalEntryTemplate', error);
        return response;
      }

      //update object in session
      organization.journalEntryTemplate = data;
      return response;
    } else if (this.isWorkLocal()) {
      const blobMeta = await BlobService.getBlobMeta(BLOB_URL_JOURNAL_ENTRY_TEMPLATE);
      if (data === null) {
        if (blobMeta) {
          await BlobService.clearBlobContent(blobMeta.id);
        }
        return { error: undefined, result: true };
      } else {
        const saveResult = await BlobService.saveTextAsBlobContent(
          JSON.stringify(data),
          'application/json',
          blobMeta?.id,
          BLOB_URL_JOURNAL_ENTRY_TEMPLATE,
        );
        if (saveResult.blobState === 'downloaded') {
          return { error: undefined, result: true };
        }
      }
    }
    return { error: true, result: undefined };
  }

  public async getJournalEntryTemplate() {
    const organization = this.getOrganization();
    if (organization?.documentId) {
      return organization.journalEntryTemplate;
    } else if (this.isWorkLocal()) {
      const blobMeta = await BlobService.getBlobMeta(BLOB_URL_JOURNAL_ENTRY_TEMPLATE);
      if (blobMeta && blobMeta.blobState === 'downloaded') {
        const content = await BlobService.getBlobContentAsText(blobMeta.id);
        if (content) {
          return JSON.parse(content);
        }
      }
    }
    return null;
  }

  public getLabel(): string | undefined {
    return this._session.value?.label;
  }

  public observeLabel(): Observable<string | undefined> {
    return this._session.pipe(map((session) => session?.label));
  }

  public setLabel(label: string): void {
    const currentSession = this._session.value;
    if (currentSession) {
      currentSession.label = label;
      this._session.next(currentSession);
    }
  }

  public observeAuthError(): Observable<HttpErrorResponse | undefined> {
    return this._authError.asObservable();
  }

  public observeOrganizationId(): Observable<string | undefined> {
    return this._session.pipe(
      map((session) => session?.organization?.documentId ?? (this.isWorkLocal() ? 'local' : undefined)),
    );
  }

  private static isLoadedOperation(operation?: IZsMapOperation): boolean {
    const elementCount = Object.keys(operation?.mapState?.drawElements || {})?.length;
    return elementCount !== undefined && elementCount > 0;
  }

  public async setOperation(operation?: IZsMapOperation): Promise<void> {
    if (this._session?.value) {
      const sessionOperation = this._session.value.operation;
      if (
        operation === undefined &&
        sessionOperation !== undefined &&
        SessionService.isLoadedOperation(sessionOperation)
      ) {
        //backup operation in case offline / no server connection to allow continue work later
        await OperationService.persistLocalOperation(sessionOperation);
      }
      this._session.value.operation = operation;
    }
    this._session.next(this._session.value);
  }

  public observeOperationId(): Observable<string | undefined> {
    return this._session.pipe(map((session) => session?.operation?.documentId));
  }

  public getOperation(): IZsMapOperation | undefined {
    return this._session?.value?.operation;
  }

  public getOperationId(): string | undefined {
    return this._session?.value?.operation?.documentId;
  }

  public getOperationName(): string | undefined {
    return this._session?.value?.operation?.name;
  }

  public getOperationEventStates(): number[] | undefined {
    return this._session?.value?.operation?.eventStates;
  }

  public getLogo(): string | undefined {
    return this._session?.value?.organizationLogo;
  }

  // skipcq: JS-0105
  public async getSavedSession(): Promise<IZsMapSession | undefined> {
    const sessions = await db.sessions.toArray();
    if (sessions.length === 1) {
      return sessions[0];
    }
    if (sessions.length > 1) {
      if (this.isOnline()) {
        return db.sessions.get('current');
      } else {
        return db.sessions.get('local');
      }
    }
    return undefined;
  }

  public async loadSavedSession(): Promise<void> {
    const session = await this.getSavedSession();
    if (session?.jwt) {
      await this.updateJWT(session?.jwt);
      return;
    } else if (session?.workLocal) {
      this._session.next(session);
      return;
    }
    this._session.next(undefined);
  }

  public async login(params: { identifier: string; password: string }): Promise<void> {
    const { result, error: authError } = await this._api.post<IAuthResult>('/api/auth/local', params);
    this._authError.next(authError);
    if (authError || !result?.jwt) {
      await this._router.navigate(['login'], { queryParamsHandling: 'preserve' });
      return;
    }

    if (params.identifier !== GUEST_USER_IDENTIFIER) {
      localStorage.setItem(ALLOW_OFFLINE_ACCESS_KEY, '1');
    }

    await this.updateJWT(result.jwt);
  }

  public async shareLogin(accessToken: string) {
    if (!accessToken) {
      await this._router.navigate(['login'], { queryParamsHandling: 'preserve' });
      return;
    }
    const { result, error: authError } = await this._api.post<IAuthResult>(
      '/api/accesses/auth/token',
      { accessToken },
      { preventAuthorization: true },
    );
    this._authError.next(authError);
    if (authError || !result?.jwt) {
      await this._router.navigate(['login'], { queryParamsHandling: 'preserve' });
      return;
    }
    await this.updateJWT(result.jwt);
  }

  public async updateJWT(jwt: string) {
    const decoded = decodeJWT(jwt);
    if (decoded.expired) {
      await this.logout('expired');
      return;
    }

    const currentSession = await this.getSavedSession();

    const { error, result: meResult } = await this._api.get<{ organization: IZsMapOrganization }>('/api/users/me', {
      token: jwt,
    });

    if (error || !meResult) {
      if (
        currentSession &&
        !currentSession.workLocal &&
        currentSession.jwt === jwt &&
        ((error?.status ?? 0) >= 500 || error?.message?.startsWith('NetworkError') || !this._isOnline.value)
      ) {
        //session is not expired but there seams to be a network problem, keep current session
        this._session.next(currentSession);
        return;
      }
      await this.logout(
        (error?.status ?? 0) >= 500 || error?.message?.startsWith('NetworkError') ? 'networkError' : 'noToken',
      );
      return;
    }

    let newSession: IZsMapSession;

    if (currentSession && !currentSession.workLocal) {
      newSession = currentSession;
    } else {
      newSession = {
        id: 'current',
        locale: DEFAULT_LOCALE,
      };
    }

    newSession.permission = decoded.permission || PermissionType.ALL;

    newSession.label = newSession.label || meResult.organization?.name || meResult.organization?.id.toString();

    // update organization values
    newSession.jwt = jwt;
    newSession.organizationLogo = meResult.organization?.logo?.url;
    newSession.organization = meResult.organization;

    newSession.defaultLongitude = newSession.organization?.mapLongitude;
    newSession.defaultLatitude = newSession.organization?.mapLatitude;

    // update operation values
    const queryParams = await firstValueFrom(this._router.routerState.root.queryParams);
    const operationId = decoded.operationId || queryParams['operationId'] || currentSession?.operation?.documentId;
    if (operationId) {
      const operation = await this._operationService.getOperation(operationId, { token: jwt });
      if (operation) {
        newSession.operation = operation;
      }
    }

    this._session.next(newSession);
  }

  public isWorkLocal() {
    return this._session.value?.workLocal === true;
  }

  public startWorkLocal() {
    const newSession: IZsMapSession = {
      id: 'local',
      locale: DEFAULT_LOCALE,
      workLocal: true,
      permission: PermissionType.ALL,
      label: 'local',
    };

    this._session.next(newSession);
  }

  public async logout(reason: LogoutReason): Promise<void> {
    if (reason === 'networkError' || (!this._isOnline.value && reason !== 'logout')) {
      //local backup operation if "logout" because of networkError
      const operation = this._session.value?.operation;
      if (operation) {
        await OperationService.persistLocalOperation(operation);
        return;
      }
    }
    OperationService.deleteNoneLocalOperations();
    this._session.next(undefined);
    await this._router.navigateByUrl('/login');
  }

  public async refreshToken(): Promise<void> {
    if (this.isWorkLocal()) {
      return;
    }
    const currentToken = this._session.value?.jwt;
    if (!currentToken) {
      await this.logout('noToken');
      return;
    }

    const { result, error: authError } = await this._api.get<IAuthResult>('/api/accesses/auth/refresh', {
      token: currentToken,
    });

    if (authError || !result?.jwt) {
      if (decodeJWT(currentToken).expired) {
        await this.logout('expired');
      } else if (
        (authError?.status ?? 0) >= 500 ||
        authError?.message?.startsWith('NetworkError') ||
        !this._isOnline.value
      ) {
        //await this.logout('networkError');
        //session is not expired but there seams to be a network problem, keep current session without refresh
      } else {
        await this.logout('noToken');
      }
      return;
    }

    await this.updateJWT(result.jwt);
  }

  public getToken(): string | undefined {
    return this._session.value?.jwt;
  }

  public observeAuthenticated(): Observable<boolean> {
    return this._session.pipe(
      map((session) => {
        if (session?.workLocal) {
          return true;
        }
        if (!session?.jwt) {
          return false;
        }
        if (decodeJWT(session.jwt).expired) {
          this.logout('expired');
          return false;
        }
        return true;
      }),
    );
  }

  public setLocale(locale: Locale): void {
    const currentSession = this._session.value;
    if (currentSession) {
      currentSession.locale = locale;
      this._session.next(currentSession);
    }
  }

  public getLocale(): Locale {
    return this._session.value?.locale ?? DEFAULT_LOCALE;
  }

  public observeIsOnline(): Observable<boolean> {
    return this._isOnline.pipe(distinctUntilChanged());
  }

  public isOnline(): boolean {
    return this._isOnline.value;
  }

  public async generateShareLink(permission: PermissionType, tokenType: AccessTokenType) {
    if (!this.getOperationId()) {
      throw new Error('OperationId is not defined');
    }
    const response = await this._api.post<{ accessToken: string }>('/api/accesses/auth/token/generate', {
      type: permission,
      operationId: this.getOperationId(),
      tokenType,
    });
    if (!response.result?.accessToken) {
      throw new Error('Unable to generate share url');
    }
    return response.result.accessToken;
  }

  public observeHasWritePermission(): Observable<boolean> {
    return this._session.pipe(
      map((session) => {
        return !(session?.permission === PermissionType.READ);
      }),
    );
  }

  public hasWritePermission(): boolean {
    return !(this._session.value?.permission === PermissionType.READ);
  }

  public observeIsArchived(): Observable<boolean> {
    return this._session.pipe(
      map((session) => {
        return session?.operation?.phase === 'archived';
      }),
    );
  }

  public isArchived(): boolean {
    return this._session.value?.operation?.phase === 'archived';
  }

  public getDefaultMapCenter(): number[] {
    if (coordinatesProjection && mercatorProjection) {
      if (this._session.value?.defaultLatitude && this._session.value?.defaultLongitude) {
        return transform(
          [this._session.value?.defaultLongitude, this._session.value?.defaultLatitude],
          coordinatesProjection,
          mercatorProjection,
        );
      } else if (
        this._session.value?.operation?.mapState?.center[0] &&
        this._session.value?.operation?.mapState?.center[1]
      ) {
        return transform(this._session.value.operation.mapState.center, coordinatesProjection, mercatorProjection);
      }
    }
    return DEFAULT_COORDINATES;
  }

  public getDefaultMapZoom(): number {
    return this._session.value?.defaultZoomLevel || DEFAULT_ZOOM;
  }
}
