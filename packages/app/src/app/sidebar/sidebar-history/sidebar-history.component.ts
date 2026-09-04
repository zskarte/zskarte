import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, effect, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { filter, startWith, switchMap, tap } from 'rxjs';
import { trpc } from '../../api/trpc.client';
import { trpcRequest } from '../../api/trpc.error';
import { SessionService } from '../../session/session.service';
import { I18NService } from '../../state/i18n.service';
import { ZsMapStateService } from '../../state/state.service';
import { IZsChangeset, IZsMapOperation } from '@zskarte/types';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MapRendererService } from '../../map-renderer/map-renderer.service';
import { ChangeDetailComponent } from '../../changeset/change-detail/change-detail.component';

/** page size of the snapshot table, shared between the paginator of the template and the query */
const SNAPSHOT_PAGE_SIZE = 20;

/** projection of `mapSnapshot.list`, inferred from the client so the `fields` allowlist stays authoritative */
type MapSnapshotList = Awaited<ReturnType<typeof trpc.mapSnapshot.list.query>>;
export type IZsMapSnapshotListed = MapSnapshotList['data'][number];

interface IZsMapSnapshotExtended extends IZsMapSnapshotListed {
  changesets: IZsChangeset[];
}
export type IZsMapSnapshots = Omit<MapSnapshotList, 'data'> & { data: IZsMapSnapshotExtended[] };

@Component({
  selector: 'app-sidebar-history',
  templateUrl: './sidebar-history.component.html',
  styleUrls: ['./sidebar-history.component.scss'],
  imports: [
    MatTableModule,
    MatPaginatorModule,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    ChangeDetailComponent,
    CommonModule,
  ],
})
export class SidebarHistoryComponent implements AfterViewInit, OnDestroy {
  i18n = inject(I18NService);
  readonly paginator = viewChild.required(MatPaginator);
  activeSnapshot?: string | null;
  activeChangeset?: string;
  highlightedChangeset?: string;
  currentChangesets: IZsChangeset[] = [];
  expertView: boolean;
  operation?: IZsMapOperation;
  snapshots = signal<IZsMapSnapshots | undefined>(undefined);
  resultSize?: number;
  readonly pageSize = SNAPSHOT_PAGE_SIZE;
  private sessionService = inject(SessionService);
  private stateService = inject(ZsMapStateService);
  readonly historyDate = toSignal(this.stateService.observeHistoryDate());
  private rendererService = inject(MapRendererService);
  private snackBarService = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.expertView = this.stateService.isExpertView();
    this.operation = this.sessionService.getOperation();

    effect(() => {
      const historyDate = this.historyDate();
      const snapshots = this.snapshots();
      if (historyDate && snapshots) {
        const activeEntry = snapshots.data.find((s) => s.createdAt?.getTime() === historyDate.getTime());
        this.activeSnapshot = activeEntry?.documentId;
      } else if (!historyDate) {
        this.activeSnapshot = null;
      }
    });
  }

  async ngAfterViewInit() {
    this.paginator()
      .page.pipe(
        startWith({ pageIndex: 0 }),
        switchMap(async (p) => {
          const page = p.pageIndex + 1;
          const operationId = this.sessionService.getOperationId();
          if (!operationId) {
            return undefined;
          }
          const { result } = await trpcRequest(
            trpc.mapSnapshot.list.query({
              operationId,
              page,
              pageSize: SNAPSHOT_PAGE_SIZE,
              // `mapState` stays off the wire, the table only renders the timestamp and the changesets
              fields: ['createdAt', 'changesetIds'],
            }),
          );
          if (!result) {
            return undefined;
          }

          const snapshots: IZsMapSnapshots = {
            ...result,
            data: result.data.map((s) => ({
              ...s,
              changesets: (s.changesetIds ?? [])
                .map((c) => this.operation?.changesets?.[c])
                .filter((c): c is IZsChangeset => !!c)
                .reverse(),
            })),
          };

          if (
            page === 1 &&
            snapshots.data.length > 0 &&
            this.operation?.mapState?.changesetIds &&
            this.operation?.mapState?.changesetIds.length > 0
          ) {
            const latestChangesetIds = snapshots.data[0].changesetIds ?? [];
            const latestChangesetId = latestChangesetIds[latestChangesetIds.length - 1];
            const changesetIds = this.operation.mapState.changesetIds.slice(
              this.operation.mapState.changesetIds.indexOf(latestChangesetId) + 1,
            );

            this.currentChangesets = changesetIds
              ?.map((c) => this.operation?.changesets?.[c])
              .filter((c): c is IZsChangeset => !!c)
              .reverse();
          }

          return snapshots;
        }),
        tap((r) => {
          this.resultSize = r?.meta.pagination.total;
        }),
        filter((r) => !!r),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => this.snapshots.set(result));
  }

  ngOnDestroy(): void {
    this.stateService.replaceHighlightedFeatures([]);
  }

  async setHistory(snapshot: IZsMapSnapshotListed) {
    this.activeSnapshot = snapshot.documentId;
    const result = await trpc.mapSnapshot.byId.query({ documentId: snapshot.documentId });

    this.stateService.setMapState(result.mapState ?? undefined, snapshot.createdAt);

    this.snackBarService.open(
      `${this.i18n.get('toastSnapshotApplied')}: ${snapshot.createdAt?.toLocaleString()}`,
      'OK',
      {
        duration: 2000,
      },
    );
  }

  async setCurrent() {
    this.activeSnapshot = undefined;
    await this.stateService.refreshMapState();

    this.snackBarService.open(this.i18n.get('currentStateActive'), 'OK', {
      duration: 2000,
    });
  }

  highlightChangedElements(changeset: IZsChangeset) {
    this.highlightedChangeset = changeset.id;
    this.stateService.replaceHighlightedFeatures(changeset.changedDrawElements);
    this.rendererService.zoomToAll(changeset.changedDrawElements);
  }

  async showDetails(changeset: IZsChangeset) {
    this.activeChangeset = changeset.id;
  }
}
