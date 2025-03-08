import { Injectable, effect, inject, resource, signal } from '@angular/core';
import { JournalEntry } from './journal.types';
import { ApiService } from '../api/api.service';
import { SessionService } from '../session/session.service';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JournalService {
  private _api = inject(ApiService);
  private _session = inject(SessionService);
  private operationId = signal<string | null>(null);
  private journalResource = resource({
    request: () => ({
      operationId: this.operationId(),
    }),
    loader: async (params) => {
      if (!params.request.operationId) {
        return [];
      }
      const { result } = await this._api.get<JournalEntry[]>(
        `/api/journal-entries?operationId=${params.request.operationId}`,
      );
      return (result as JournalEntry[]) || [];
    },
  });
  readonly data = this.journalResource.value;
  readonly loading = this.journalResource.isLoading;
  readonly error = this.journalResource.error;
  readonly reload = () => this.journalResource.reload();

  private drawingEntrySignal = signal<JournalEntry | null>(null);
  get drawingEntry() {
    return this.drawingEntrySignal();
  }
  set drawingEntry(newValue: JournalEntry | null) {
    const oldValue = this.drawingEntrySignal();
    if (oldValue !== newValue) {
      if (oldValue?.isDrawingOnMap) {
        this.updateDrawingState(oldValue, false);
      }
      this.drawingEntrySignal.set(newValue);
      if (newValue) {
        this.updateDrawingState(newValue, true);
      }
    }
  }

  constructor() {
    effect(() => {
      this._session
        .observeOperationId()
        .pipe(
          tap((operationId) => this.operationId.set(operationId as string)),
          tap(() => this.journalResource.reload()),
        )
        .subscribe();
    });
  }

  public async get(documentId: string) {
    const { error, result } = await this._api.get<JournalEntry>(`/api/journal-entries/${documentId}`);
    if (error || !result) {
      console.error(`could not get journalEntry ${documentId}`, error);
      return null;
    }
    return result;
  }

  public async insert(entry: JournalEntry) {
    const operation = this._session.getOperation();
    const organization = this._session.getOrganization();
    return this._api.post<JournalEntry>('/api/journal-entries', {
      data: {
        ...entry,
        operation: operation?.documentId,
        organization: organization?.documentId,
      },
    });
  }

  public async update(entry: Partial<JournalEntry>, documentId?: string) {
    const { documentId: documentIdEntry, ...data } = entry;
    return this._api.put<JournalEntry>(`/api/journal-entries/${documentId ?? documentIdEntry}`, { data });
  }

  public async save(entry: JournalEntry) {
    if (entry.documentId) {
      return this.update(entry);
    } else {
      return this.insert(entry);
    }
  }

  public startDrawing(entry: JournalEntry, value: boolean) {
    this.drawingEntry = value ? entry : null;
  }

  private async updateDrawingState(entry: JournalEntry, value: boolean) {
    const { error, result } = await this.update(
      {
        isDrawingOnMap: value,
      },
      entry.documentId,
    );
    if (error || !result) {
      console.error('Error updating journal entry:', error);
    } else {
      this.journalResource.reload();
    }
  }

  public async markAsDrawn(entry: JournalEntry, value: boolean) {
    const { error, result } = await this.update(
      value
        ? {
            isDrawnOnMap: value,
            isDrawingOnMap: false,
          }
        : {
            isDrawnOnMap: value,
          },
      entry.documentId,
    );

    if (error || !result) {
      console.error('Error updating journal entry:', error);
    } else {
      this.drawingEntrySignal.set(null);
      this.journalResource.reload();
    }
  }
}
