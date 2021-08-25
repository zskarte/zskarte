import { Component } from '@angular/core';
import { SharedStateService } from '../shared-state.service';
import { I18NService } from '../i18n.service';
import { MapStoreService } from '../map-store.service';
import { DisplayMode } from '../entity/displayMode';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})
export class HistoryComponent {
  history = null;
  private _historyDatesAll = null;
  private _historyDatesAllLocale = null;
  private _historyDatesFiltered = null;
  private _historyDatesFilteredLocale = null;
  tagSource = null;
  public showHistory = false;
  filtered = true;
  loading = false;
  private selectedDate: string;

  constructor(
    private sharedState: SharedStateService,
    private mapStore: MapStoreService,
    public i18n: I18NService
  ) {
    this.sharedState.displayMode.subscribe((m) =>
      this.loadHistoryWhenEnabled(m)
    );
    this.sharedState.session.subscribe((s) => {
      if (s) {
        this.history = null;
        this.loadHistoryWhenEnabled(this.sharedState.displayMode.getValue());
      }
    });
    this.loadHistoryWhenEnabled(this.sharedState.displayMode.getValue());
  }

  getDownloadFileName() {
    return 'history_zskarte_' + this.selectedDate + '.geojson';
  }

  selectNow() {
    this.selectedDate = 'now';
    this.sharedState.gotoHistory('now');
  }

  select(date: string, index: number) {
    this.selectedDate = date;
    this.sharedState.gotoHistory(this.historyDates[index]);
  }

  get historyDates(): string[] {
    if (this.filtered) {
      return this._historyDatesFiltered;
    }
    return this._historyDatesAll;
  }

  get historyDatesLocale(): string[] {
    if (this.filtered) {
      if (
        this.selectedDate !== 'now' &&
        !this._historyDatesFilteredLocale.includes(this.selectedDate)
      ) {
        this.selectNow();
      }
      return this._historyDatesFilteredLocale;
    }
    return this._historyDatesAllLocale;
  }

  private loadHistoryWhenEnabled(mode: DisplayMode) {
    if (!this.showHistory && mode === DisplayMode.HISTORY) {
      this.selectedDate = null;
    }
    this.showHistory = mode === DisplayMode.HISTORY;
    if (this.showHistory && this.sharedState.getCurrentSession()) {
      this.loadHistoryFromDB();
    }
  }

  getTag(index: number): string {
    const key = this.historyDates[index];
    return this.tagSource && this.tagSource[key] ? this.tagSource[key] : null;
  }

  getLabel(index: number): string {
    const key = this.historyDates[index];
    if (this.tagSource && this.tagSource[key]) {
      return this.tagSource[key] + ' (' + this.historyDatesLocale[index] + ')';
    }
    return this.historyDatesLocale[index];
  }

  loadHistory(history) {
    const TIME_DIFF_BETWEEN_EVENTS = 30 * 60 * 1000;
    this.history = history;
    this.tagSource = history.tags;
    this._historyDatesAll = Object.keys(history.states).sort().reverse();
    this._historyDatesAllLocale = this._historyDatesAll.map((h) =>
      new Date(h).toLocaleString()
    );
    let lastDate: Date = null;
    this._historyDatesFiltered = [];
    for (const historyDate of this._historyDatesAll) {
      const realDate = new Date(historyDate);
      if (
        !lastDate ||
        historyDate ===
          this._historyDatesAll[this._historyDatesAll.length - 1] ||
        lastDate.getTime() - realDate.getTime() > TIME_DIFF_BETWEEN_EVENTS ||
        historyDate in this.tagSource
      ) {
        this._historyDatesFiltered.push(historyDate);
        lastDate = realDate;
      }
    }
    this._historyDatesFilteredLocale = this._historyDatesFiltered.map((h) =>
      new Date(h).toLocaleString()
    );
    if (
      !this.selectedDate ||
      (this.selectedDate !== 'now' &&
        !this.historyDatesLocale.includes(this.selectedDate))
    ) {
      this.selectNow();
    }
    this.loading = false;
  }

  private loadHistoryFromDB() {
    this.loading = true;
    this.mapStore
      .getHistory(this.sharedState.getCurrentSession().uuid)
      .then((history) => this.loadHistory(history));
  }

  endHistoryMode() {
    this.selectedDate = null;
    // We're returning to the draw mode.
    this.sharedState.displayMode.next(DisplayMode.DRAW);
  }

  removeTag(index) {
    this.mapStore
      .removeTag(
        this.sharedState.getCurrentSession().uuid,
        this.historyDates[index]
      )
      .then(() => {
        this.loadHistoryFromDB();
      });
  }
}
