import { Injectable, inject } from '@angular/core';
import { SessionService } from '../session/session.service';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from '../helper/debounce';
import { ZsMapStateService } from '../state/state.service';
import { BehaviorSubject, debounceTime, filter, merge, switchMap } from 'rxjs';
import { JournalService } from '../journal/journal.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { ChangesetInconsistentError } from '@zskarte/types';
import { ChangesetService } from '../changeset/changeset.service';
import { trpc } from '../api/trpc.client';

export interface User {
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
}

interface Connection {
  user: User;
  identifier: string;
  label?: string;
  currentLocation?: { long: number; lat: number };
}

const RECONNECT_ACTIVE_CONNECTION_TIME = 900_000;
const TRY_RECONNECT_NO_CONNECTION_TIME = 60_000;

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private _session = inject(SessionService);
  private _journal = inject(JournalService);
  private _changeset = inject(ChangesetService);

  private _connectionId = uuidv4();
  private _subscriptions: { unsubscribe(): void }[] = [];
  private _subscriptionGeneration = 0;
  private _state!: ZsMapStateService;
  private _connectingPromise: Promise<void> | undefined;
  private _reonnectPublishPromise: Promise<void> | undefined;
  private _connections = new BehaviorSubject<Connection[]>([]);

  private journalChange$ = toObservable(this._journal.data);

  constructor() {
    // Reload the websocket every 15min if nothing changed
    // each _reconnect try(respectively _disconnect) will set _connections again to [] and emit again
    const noChanges$ = this.observeConnections().pipe(
      filter((con) => con.length > 0),
      switchMap(() => merge(this._state.observeMapState(), this.journalChange$)),
      debounceTime(RECONNECT_ACTIVE_CONNECTION_TIME),
    );
    const lostConnection$ = this.observeConnections().pipe(
      debounceTime(TRY_RECONNECT_NO_CONNECTION_TIME),
      filter((con) => con.length === 0 && this._session.isOnline()),
    );

    merge(
      this._session.observeOperationId(),
      this._session.observeIsOnline(),
      this._session.observeLabel(),
      noChanges$,
      lostConnection$,
    )
      .pipe(debounceTime(250))
      .subscribe(async () => {
        const operationId = this._session.getOperationId();
        const isOnline = this._session.isOnline();
        const label = this._session.getLabel();
        const isWorkLocal = this._session.isWorkLocal();
        if (isWorkLocal || !isOnline || !operationId || operationId.startsWith('local-') || !label) {
          this._disconnect();
          return;
        }

        //prevent multiple submit of same patches
        if (this._reonnectPublishPromise) {
          return this._reonnectPublishPromise;
        }
        let promisResolver!: () => void;
        let promisReject!: (reason?: any) => void;
        this._reonnectPublishPromise = new Promise((resolve, reject) => {
          promisResolver = resolve;
          promisReject = reject;
        });
        try {
          //handle journal patches before reconnect websocket (for correct message number mapping)
          await this._journal.publishPatches();
          await this._reconnect();

          //after successfull reconnect and session initialized send changesets
          if (this._session.sessionInitialized()) {
            try {
              if (this._changeset.inconsistent()) {
                throw new ChangesetInconsistentError(this._changeset.errorChangeset()?.id ?? '-1');
              }
              if (!this._changeset.hasChanges()) {
                await this._changeset.submitOutgoing();
              } else {
                this._changeset.offlineMode.set(false);
              }
            } catch (error) {
              console.error('error on submit outgoing changesets after reconnect:', error);
            }
          }
          promisResolver();
        } catch (ex: any) {
          promisReject(ex);
        } finally {
          this._reonnectPublishPromise = undefined;
        }
      });

    this._changeset.setConnectionId(this._connectionId);
  }

  public setStateService(state: ZsMapStateService): void {
    this._state = state;
  }

  private async _reconnect(): Promise<void> {
    this._disconnect();
    await this._connect();
  }

  private async _connect(): Promise<void> {
    if (this._subscriptions.length > 0) {
      return;
    }

    if (this._connectingPromise) {
      return this._connectingPromise;
    }

    const operationId = this._session.getOperationId();
    const label = this._session.getLabel();
    if (!operationId || !label) return;
    const generation = ++this._subscriptionGeneration;

    this._connectingPromise = new Promise<void>((resolve, reject) => {
      let started = 0;
      let settled = false;
      const onStarted = () => {
        started += 1;
        if (started === this._subscriptions.length) {
          settled = true;
          resolve();
        }
      };
      const onError = (error: unknown) => {
        if (generation !== this._subscriptionGeneration) return;
        console.error('Error while connecting to realtime subscriptions', error);
        this._disconnect();
        if (!settled) reject(error);
      };

      this._subscriptions = [
        trpc.operation.onChangeset.subscribe(
          { operationId, identifier: this._connectionId },
          {
            onStarted,
            onData: (data) => this._state.addIncommingChangeset(data.changeset, data.sign),
            onError,
            onStopped: () => {
              if (generation === this._subscriptionGeneration) this._disconnect();
            },
            onComplete: () => {
              if (generation === this._subscriptionGeneration) this._disconnect();
            },
          },
        ),
        trpc.operation.onConnections.subscribe(
          { operationId, identifier: this._connectionId, label },
          {
            onStarted,
            onData: (connections) => this._connections.next(connections),
            onError,
            onStopped: () => {
              if (generation === this._subscriptionGeneration) this._disconnect();
            },
            onComplete: () => {
              if (generation === this._subscriptionGeneration) this._disconnect();
            },
          },
        ),
      ];

      if (!this._state.getShowCurrentLocation()) return;
      setTimeout(() => {
        this._state.updateShowCurrentLocation(false);
        this._state.updateShowCurrentLocation(true);
      }, 500);
    }).finally(() => {
      this._connectingPromise = undefined;
    });

    await this._connectingPromise;
  }

  private _disconnect(): void {
    this._subscriptionGeneration += 1;
    this._connections.next([]);
    for (const subscription of this._subscriptions) subscription.unsubscribe();
    this._subscriptions = [];
  }

  public publishCurrentLocation = debounce(async (longLat: { long: number; lat: number } | undefined) => {
    if (!this._session.isWorkLocal()) {
      await this._publishCurrentLocation(longLat);
    }
  }, 1000);

  private async _publishCurrentLocation(longLat: { long: number; lat: number } | undefined): Promise<void> {
    const operationId = this._session.getOperationId();
    if (!operationId) return;
    await trpc.operation.publishCurrentLocation.mutate({
      operationId,
      identifier: this._connectionId,
      location: longLat,
    });
  }

  public observeConnections() {
    return this._connections.asObservable();
  }
}
