import { Component, inject, resource } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../api/api.service';
import { JournalEntry } from '../../journal/journal.types';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { I18NService } from '../../state/i18n.service';


@Component({
  selector: 'app-sidebar-journal',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatProgressSpinnerModule, MatButtonModule, MatDividerModule],
  templateUrl: './sidebar-journal.component.html',
  styleUrl: './sidebar-journal.component.scss',
})
export class SidebarJournalComponent {
  private apiService = inject(ApiService);
  i18n = inject(I18NService);
  journalResource = resource({
    request: () => ({}),
    loader: async () => {
      const { result } = await this.apiService.get<JournalEntry[]>('/api/journal-entries');
      return result as JournalEntry[] || [];
    }
  });

  get journalEntriesToDraw() {
    return (this.journalResource.value() || []).filter(entry => !entry.is_drawn_on_map);
  }

  get journalEntriesDrawn() {
    return (this.journalResource.value() || []).filter(entry => entry.is_drawn_on_map);
  }

  async markAsDrawn(entry: JournalEntry) {
    try {
      await this.apiService.put<JournalEntry>(`/api/journal-entries/${entry.id}`, {
        data: {
          ...entry,
          is_drawn_on_map: true,
        },
      });
      await this.journalResource.reload();
    } catch (error) {
      console.error('Error updating journal entry:', error);
    }
  }

  async markAsNotDrawn(entry: JournalEntry) {
    try {
      await this.apiService.put<JournalEntry>(`/api/journal-entries/${entry.id}`, {
        data: {
          ...entry, 
          is_drawn_on_map: false,
        },
      });
      await this.journalResource.reload();
    } catch (error) {
      console.error('Error updating journal entry:', error);
    }
  }
}
