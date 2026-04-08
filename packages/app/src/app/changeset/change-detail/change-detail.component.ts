import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../api/api.service';
import { SessionService } from '../../session/session.service';
import { I18NService } from '../../state/i18n.service';
import { ZsMapStateService } from '../../state/state.service';
import { IZsChangeInfos, IZsChangeset, IZsMapOperation, IZsMapSnapshot, ZsMapState } from '@zskarte/types';
import { MatIconModule } from '@angular/material/icon';
import { ChangesetService, NO_CONFLICT_VALUE } from 'src/app/changeset/changeset.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-change-detail',
  templateUrl: './change-detail.component.html',
  styleUrl: './change-detail.component.scss',
  imports: [MatButtonModule, MatIconModule],
})
export class ChangeDetailComponent {
  NO_CONFLICT_VALUE = NO_CONFLICT_VALUE;
  i18n = inject(I18NService);
  private apiService = inject(ApiService);
  private sessionService = inject(SessionService);
  private stateService = inject(ZsMapStateService);
  private changestService = inject(ChangesetService);
  private snackBarService = inject(MatSnackBar);

  readonly changeset = input<IZsChangeset>();
  readonly snapshotId = input<string>();
  readonly snapshot = signal<IZsMapSnapshot | undefined>(undefined);
  readonly historyDate = toSignal(this.stateService.observeHistoryDate());
  readonly activeState = signal<number>(0);

  readonly changesetDetails = signal<
    | {
        mapStateBefore: ZsMapState;
        changeset: IZsChangeset;
        mapStateAfter: ZsMapState;
        snapshot: IZsMapSnapshot;
        changes: IZsChangeInfos[];
        dateBefore: Date;
        dateAfter: Date;
      }
    | undefined
  >(undefined);

  operation?: IZsMapOperation;
  readonly snapshotApiPath = '/api/map-snapshots';

  constructor() {
    this.operation = this.sessionService.getOperation();

    effect(() => {
      const id = this.snapshotId();
      if (!id) return;

      this.apiService
        .get<IZsMapSnapshot>(`${this.snapshotApiPath}/${id}`)
        .then((response) => this.snapshot.set(response.result));
    });
    effect(() => {
      const changeset = this.changeset();
      const snapshot = this.snapshot();
      if (changeset && snapshot) {
        this.showDetails(changeset, snapshot);
      }
    });
    effect(() => {
      const details = this.changesetDetails();
      const historyDate = this.historyDate();
      if (details) {
        if (!historyDate) {
          this.activeState.set(0);
        } else if (historyDate.getTime() === details.dateBefore.getTime()) {
          this.activeState.set(1);
        } else if (historyDate.getTime() === details.dateAfter.getTime()) {
          this.activeState.set(2);
        } else {
          this.activeState.set(0);
        }
      }
    });
  }

  async showDetails(changeset: IZsChangeset, snapshot: IZsMapSnapshot) {
    let mapStateAfter = snapshot.mapState;
    if (snapshot.changesetIds.length > 1) {
      const toUnapply = snapshot.changesetIds.slice(snapshot.changesetIds.indexOf(changeset.id) + 1).reverse();
      toUnapply.forEach((id) => {
        const c = this.operation?.changesets?.[id];
        if (c) {
          mapStateAfter = this.changestService.unapplyChangeset(mapStateAfter, {...c});
        }
      });
    }
    const mapStateBefore = this.changestService.unapplyChangeset(mapStateAfter, {...changeset});
    const changes = this.changestService.getChanges(changeset, mapStateBefore);

    const dateBefore = new Date(changeset.startAt);
    const dateAfter = new Date(changeset.endAt || changeset.lastChangeAt || snapshot.createdAt);

    this.changesetDetails.set({ mapStateBefore, changeset, mapStateAfter, snapshot, changes, dateBefore, dateAfter });
  }

  showDetailsBefore() {
    const details = this.changesetDetails();
    if (details) {
      this.activeState.set(1);
      this.stateService.setMapState(details.mapStateBefore, details.dateBefore);
      this.snackBarService.open(
        `${this.i18n.get('toastSnapshotApplied')}: ${details.dateBefore.toLocaleString()}`,
        'OK',
        {
          duration: 2000,
        },
      );
    }
  }

  showDetailsAfter() {
    const details = this.changesetDetails();
    if (details) {
      this.activeState.set(2);
      this.stateService.setMapState(details.mapStateAfter, details.dateAfter);
      this.snackBarService.open(
        `${this.i18n.get('toastSnapshotApplied')}: ${details.dateAfter.toLocaleString()}`,
        'OK',
        {
          duration: 2000,
        },
      );
    }
  }
}
