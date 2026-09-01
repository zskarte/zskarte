import { Injectable, inject, signal } from '@angular/core';
import { Params, Router } from '@angular/router';
import {
  AccessTokenType,
  DEFAULT_LOCALE,
  IZsMapDisplayState,
  IZsMapOperation,
  IZsMapOrganization,
  IZsMapOrganizationMapLayerSettings,
  IZsMapOrganizationSettings,
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
  firstValueFrom,
  map,
  skip,
  takeUntil,
} from 'rxjs';
import { ApiService } from '../api/api.service';
import { db } from '../db/db';
import { debounceLeading } from '../helper/debounce';
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
import { createAuthClient } from 'better-auth/client';
import { usernameClient } from 'better-auth/client/plugins';
import { environment } from '../../environments/environment';
import { trpc } from '../api/trpc.client';
import { trpcRequest } from '../api/trpc.error';

const LANGUAGE_PREFERENCE_KEY = 'zskarte-language-preference';

export type LogoutReason = 'logout' | 'networkError';
export type AuthError = { code?: string; message?: string };

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
  private _authError = new BehaviorSubject<AuthError | undefined>(undefined);
  private _authenticated = new BehaviorSubject(false);
  private _isOnline = new BehaviorSubject<boolean>(true);
  public readonly sessionInitialized = signal(false);
  private readonly _authClient = createAuthClient({
    baseURL: environment.apiUrlNext,
    fetchOptions: { credentials: 'include' },
    plugins: [usernameClient()],
  });

  constructor() {
    const _operationService = this._operationService;

    //"solve" circular dependency between OperationService and SessionService
    _operationService.setSessionService(this);

    if (!navigator.onLine) {
      this._isOnline.next(false);
    }

    // Initialize language preference for any existing session
    this.initializeLanguagePreference();

    this._session.pipe(skip(1)).subscribe(async (session) => {
      this._clearOperation.next();
      this.sessionInitialized.set(false);
      if (session && (this._authenticated.value || session.workLocal)) {
        await db.sessions.put(session);
        if (session.operation?.documentId) {
          const queryParams = await firstValueFrom(this._router.routerState.root.queryParams);
          await this._state?.refreshMapState(false);
          let displayState = await db.displayStates.get({
            id: session.operation?.documentId,
          });

          if (displayState && (!displayState.version || displayState.layers === undefined)) {
            //ignore invalid/empty saved displayState
            displayState = undefined;
          }
          this._state.setDisplayState(displayState);
          if (queryParams && Object.keys(queryParams).length > 0) {
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
                (s) => s.documentId && session.organization?.wms_sources.includes(s.documentId),
              );
              this._state.setWmsSources(selectedSources);
            } else {
              //if no session state, fill default wms sources from local settings
              const localMapLayerSettings = await MapLayerService.loadLocalMapLayerSettings();
              if (localMapLayerSettings?.wms_sources && localMapLayerSettings?.wms_sources.length > 0) {
                const selectedSources = globalWmsSources.filter(
                  (s) => s.documentId && localMapLayerSettings?.wms_sources.includes(s.documentId),
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
          this._state.setMapState(undefined, undefined);
          this._state.setDisplayState(undefined);
        }
        this.sessionInitialized.set(true);
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
      .subscribe(async (isOnline) => {
        if (isOnline && !this.isWorkLocal()) {
          await this.loadAuthenticatedSession();
        }
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

  public observeFavoriteLayers$(): Observable<string[] | undefined> {
    return this._session.pipe(
      concatMap(
        async (session) =>
          session?.organization?.map_layer_favorites ??
          (this.isWorkLocal() ? (await MapLayerService.loadLocalMapLayerSettings())?.map_layer_favorites : undefined),
      ),
    );
  }

  public async saveOrganizationSettings(data: IZsMapOrganizationSettings) {
    this._state.updateChangesetConfig((draft) => Object.assign(draft, data.changeset));
    const organization = this.getOrganization();
    if (organization?.documentId) {
      await trpc.organization.updateSettings.mutate({ organizationId: organization.documentId, data });

      organization.settings = data;
      //update session object
      const currentSession = this._session.value;
      if (currentSession) {
        currentSession.organization = organization;
        this._session.next(currentSession);
      }
    }
  }

  public getOrganizationSettings() {
    return this.getOrganization()?.settings;
  }

  public async saveOrganizationMapLayerSettings(data: IZsMapOrganizationMapLayerSettings) {
    const organization = this.getOrganization();
    if (organization?.documentId) {
      await trpc.organization.updateLayerSettings.mutate({ organizationId: organization.documentId, data });

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
      const response = await trpcRequest(
        trpc.organization.updateJournalEntryTemplate.mutate({
          organizationId: organization.documentId,
          // the template is an opaque pdfme/quill document, the procedure only stores it as jsonb
          data: data as Record<string, unknown> | null,
        }),
      );
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

  public observeAuthError(): Observable<AuthError | undefined> {
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
      // Set the operation synchronously first so guards can see it immediately
      this._session.value.operation = operation;
      this._session.next(this._session.value);

      // Then do async cleanup if needed (only when clearing operation)
      if (
        operation === undefined &&
        sessionOperation !== undefined &&
        SessionService.isLoadedOperation(sessionOperation)
      ) {
        //backup operation in case offline / no server connection to allow continue work later
        await OperationService.persistLocalOperation(sessionOperation);
      }
    }
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
    if (session?.workLocal) {
      this._authenticated.next(true);
      this._session.next(session);
      return;
    }
    await this.loadAuthenticatedSession();
  }

  public async login(params: { identifier: string; password: string }): Promise<void> {
    const result = await this._authClient.signIn.username({
      username: params.identifier,
      password: params.password,
    });

    if (params.identifier !== GUEST_USER_IDENTIFIER) {
      localStorage.setItem(ALLOW_OFFLINE_ACCESS_KEY, '1');
    }

    if (result.error) {
      this._authError.next(result.error);
      await this._router.navigate(['login'], { queryParamsHandling: 'preserve' });
      return;
    }

    await this.loadAuthenticatedSession();
  }

  public async shareLogin(accessToken: string) {
    if (!accessToken) {
      await this._router.navigate(['login'], { queryParamsHandling: 'preserve' });
      return;
    }
    const response = await fetch(`${environment.apiUrlNext}/api/auth/share-access/redeem`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }),
    });
    if (!response.ok) {
      await this._router.navigate(['login'], { queryParamsHandling: 'preserve' });
      return;
    }
    await this.loadAuthenticatedSession();
  }

  private async loadAuthenticatedSession(): Promise<void> {
    const currentSession = await this.getSavedSession();

    const { error, data: sessionResult } = await this._authClient.getSession();

    if (error || !sessionResult) {
      if ((error?.status ?? 0) >= 500 || !this._isOnline.value) {
        return;
      }
      this._authenticated.next(false);
      this._session.next(undefined);
      return;
    }

    const meResult = await trpc.auth.me.query();
    let newSession: IZsMapSession;

    if (currentSession && !currentSession.workLocal) {
      newSession = currentSession;
    } else {
      newSession = {
        id: 'current',
        locale: this.getPreferredLocale(),
      };
    }

    newSession.permission = meResult.zsRole === 'operationread' ? PermissionType.READ : PermissionType.ALL;

    newSession.label = newSession.label || meResult.organization?.name || meResult.organization?.documentId;

    // update organization values
    newSession.organizationLogo = meResult.organization?.logo?.url;
    newSession.organization = meResult.organization;

    newSession.defaultLongitude = newSession.organization?.mapLongitude;
    newSession.defaultLatitude = newSession.organization?.mapLatitude;

    // update operation values
    const queryParams = await firstValueFrom(this._router.routerState.root.queryParams);
    const operationId = meResult.operationId || queryParams['operationId'] || currentSession?.operation?.documentId;
    let operationJustSet = false;

    if (operationId) {
      const operation = await this._operationService.getOperation(operationId);
      if (operation) {
        operationJustSet =
          !currentSession?.operation?.documentId || currentSession.operation.documentId !== operation.documentId;
        newSession.operation = operation;
      }
    }

    this._authenticated.next(true);
    this._session.next(newSession);

    const currentUrl = this._router.url;
    if (currentUrl.startsWith('/login') && queryParams['operationId']) {
      if (operationJustSet) {
        const navQueryParams: any = { ...queryParams };
        Object.keys(navQueryParams).forEach((key) => {
          if (navQueryParams[key] === null || navQueryParams[key] === undefined) {
            delete navQueryParams[key];
          }
        });
        await this._router.navigate(['/operations'], { queryParams: navQueryParams });
      } else {
        const navQueryParams: any = { ...queryParams };
        delete navQueryParams['operationId'];
        Object.keys(navQueryParams).forEach((key) => {
          if (navQueryParams[key] === null || navQueryParams[key] === undefined) {
            delete navQueryParams[key];
          }
        });
        await this._router.navigate(['/main/map'], { queryParams: navQueryParams });
      }
    }
  }

  public isWorkLocal() {
    return this._session.value?.workLocal === true;
  }

  public startWorkLocal() {
    const newSession: IZsMapSession = {
      id: 'local',
      locale: this.getPreferredLocale(),
      workLocal: true,
      permission: PermissionType.ALL,
      label: 'local',
    };

    this._authenticated.next(true);
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
    if (reason === 'logout' && this._isOnline.value && !this.isWorkLocal()) {
      await this._authClient.signOut();
    }
    this._authenticated.next(false);
    this._session.next(undefined);
    await this._router.navigateByUrl('/login');
  }

  public observeAuthenticated(): Observable<boolean> {
    return this._authenticated.pipe(distinctUntilChanged());
  }

  public isAuthenticated(): boolean {
    return this._authenticated.value;
  }

  public setLocale(locale: Locale): void {
    // Save language preference to localStorage for persistence
    localStorage.setItem(LANGUAGE_PREFERENCE_KEY, locale);

    let currentSession = this._session.value;
    if (!currentSession) {
      // Create a minimal session for language selection before login
      currentSession = {
        id: 'pre-login',
        locale: locale,
      };
    } else {
      currentSession.locale = locale;
    }
    this._session.next(currentSession);
  }

  public getLocale(): Locale {
    return this._session.value?.locale ?? this.getPreferredLocale();
  }

  public observeLocale(): Observable<Locale> {
    return this._session.pipe(map((session) => session?.locale ?? this.getPreferredLocale()));
  }

  public observeIsOnline(): Observable<boolean> {
    return this._isOnline.pipe(distinctUntilChanged());
  }

  private getPreferredLocale(): Locale {
    const savedLanguage = localStorage.getItem(LANGUAGE_PREFERENCE_KEY) as Locale;
    if (savedLanguage && ['de', 'en', 'fr'].includes(savedLanguage)) {
      return savedLanguage;
    }
    return DEFAULT_LOCALE;
  }

  private initializeLanguagePreference(): void {
    const preferredLocale = this.getPreferredLocale();
    const currentSession = this._session.value;

    // If we have a saved language preference and it's different from the current session
    if (currentSession && preferredLocale !== DEFAULT_LOCALE && currentSession.locale !== preferredLocale) {
      currentSession.locale = preferredLocale;
      this._session.next(currentSession);
    } else if (!currentSession && preferredLocale !== DEFAULT_LOCALE) {
      // Create a minimal session with the preferred language
      this._session.next({
        id: 'language-init',
        locale: preferredLocale,
      });
    }
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
