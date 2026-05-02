import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, effect, inject, OnDestroy, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { filter, startWith, switchMap, tap } from 'rxjs';
import { ApiService } from '../../api/api.service';
import { SessionService } from '../../session/session.service';
import { I18NService } from '../../state/i18n.service';
import { ZsMapStateService } from '../../state/state.service';
import { IZsChangeset, IZsMapOperation, IZsMapSnapshot } from '@zskarte/types';
import { StrapiApiResponseList } from '../../helper/strapi-utils';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MapRendererService } from 'src/app/map-renderer/map-renderer.service';
import { ChangeDetailComponent } from 'src/app/changeset/change-detail/change-detail.component';

interface IZsMapSnapshotExtended extends IZsMapSnapshot {
  changesets: IZsChangeset[];
}
export type IZsMapSnapshots = StrapiApiResponseList<IZsMapSnapshotExtended>;

@Component({
  selector: 'app-sidebar-history',
  templateUrl: './sidebar-history.component.html',
  styleUrls: ['./sidebar-history.component.scss'],
  imports: [MatTableModule, MatPaginatorModule, DatePipe, MatButtonModule, MatIconModule, ChangeDetailComponent, CommonModule],
})
export class SidebarHistoryComponent implements AfterViewInit, OnDestroy {
  i18n = inject(I18NService);
  private apiService = inject(ApiService);
  private sessionService = inject(SessionService);
  private stateService = inject(ZsMapStateService);
  private rendererService = inject(MapRendererService);
  private snackBarService = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);
  readonly historyDate = toSignal(this.stateService.observeHistoryDate());

  readonly paginator = viewChild.required(MatPaginator);

  activeSnapshot?: string | null;
  activeChangeset?: string;
  highlightedChangeset?: string;
  currentChangesets: IZsChangeset[] = [];
  expertView: boolean;
  operation?: IZsMapOperation;

  snapshots = signal<IZsMapSnapshots | undefined>(undefined);
  resultSize?: number;
  readonly snapshotApiPath = '/api/map-snapshots';

  constructor() {
    this.expertView = this.stateService.isExpertView();
    this.operation = this.sessionService.getOperation();

    effect(() => {
      const historyDate = this.historyDate();
      const snapshots = this.snapshots();
      if (historyDate && snapshots) {
        const activeEntry = snapshots.data.find((s) => s.createdAt.getTime() === historyDate.getTime());
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
          const response = await this.apiService.get<IZsMapSnapshots>(
            `${this.snapshotApiPath}?fields[0]=createdAt&fields[1]=changesetIds&operationId=${operationId}&sort[0]=createdAt:desc&pagination[page]=${page}&pagination[pageSize]=20`,
            { keepMeta: true },
          );
          const result = response.result;
          result?.data.forEach((s) => {
            s.changesets = s.changesetIds
              ?.map((c) => this.operation?.changesets?.[c])
              .filter((c) => !!c)
              .reverse();
          });

          if (
            page === 1 &&
            result?.data &&
            result.data.length > 0 &&
            this.operation?.mapState?.changesetIds &&
            this.operation?.mapState?.changesetIds.length > 0
          ) {
            const latestChangesetId = result.data[0].changesetIds[result.data[0].changesetIds.length - 1];
            const changesetIds = this.operation.mapState.changesetIds.slice(
              this.operation.mapState.changesetIds.indexOf(latestChangesetId) + 1,
            );

            this.currentChangesets = changesetIds
              ?.map((c) => this.operation?.changesets?.[c])
              .filter((c) => !!c)
              .reverse();
          }

          return result;
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

  async setHistory(snapshot: IZsMapSnapshot) {
    this.activeSnapshot = snapshot.documentId;
    const { result } = await this.apiService.get(`${this.snapshotApiPath}/${snapshot.documentId}`);

    this.stateService.setMapState(result.mapState, snapshot.createdAt);

    this.snackBarService.open(
      `${this.i18n.get('toastSnapshotApplied')}: ${snapshot.createdAt.toLocaleString()}`,
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
