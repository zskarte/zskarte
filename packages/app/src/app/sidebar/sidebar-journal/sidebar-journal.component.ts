import { Component, inject, resource } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../api/api.service';
import { JournalEntry } from '../../journal/journal.types';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { I18NService } from '../../state/i18n.service';
import { SidebarJournalEntryComponent } from '../sidebar-journal-entry/sidebar-journal-entry.component';
import { SessionService } from '../../session/session.service';

@Component({
  selector: 'app-sidebar-journal',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDividerModule,
    SidebarJournalEntryComponent,
  ],
  templateUrl: './sidebar-journal.component.html',
  styleUrl: './sidebar-journal.component.scss',
})
export class SidebarJournalComponent {
  private apiService = inject(ApiService);
  private sessionService = inject(SessionService);
  i18n = inject(I18NService);
  journalResource = resource({
    request: () => ({
      operation: this.sessionService.getOperation()?.documentId,
    }),
    loader: async (params) => {
      const { result } = await this.apiService.get<JournalEntry[]>(
        `/api/journal-entries?operationId=${params.request.operation}`,
      );
      return (result as JournalEntry[]) || [];
    },
  });

  get journalEntriesToDraw() {
    return (this.journalResource.value() || []).filter((entry) => !entry.isDrawnOnMap);
  }

  get journalEntriesDrawn() {
    return (this.journalResource.value() || []).filter((entry) => entry.isDrawnOnMap);
  }

  async markAsDrawn(entry: JournalEntry) {
    try {
      await this.apiService.put<JournalEntry>(`/api/journal-entries/${entry.documentId}`, {
        data: {
          isDrawnOnMap: true,
        },
      });
      await this.journalResource.reload();
    } catch (error) {
      console.error('Error updating journal entry:', error);
    }
  }

  async markAsNotDrawn(entry: JournalEntry) {
    try {
      await this.apiService.put<JournalEntry>(`/api/journal-entries/${entry.documentId}`, {
        data: {
          isDrawnOnMap: false,
        },
      });
      await this.journalResource.reload();
    } catch (error) {
      console.error('Error updating journal entry:', error);
    }
  }
}
