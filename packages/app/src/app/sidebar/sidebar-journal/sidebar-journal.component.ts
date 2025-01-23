import { Component, inject, resource } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../api/api.service';
import { JournalEntry } from '../../journal/journal.types';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';


@Component({
  selector: 'app-sidebar-journal',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatProgressSpinnerModule, MatButtonModule, MatDividerModule],
  templateUrl: './sidebar-journal.component.html',
  styleUrl: './sidebar-journal.component.scss',
})
export class SidebarJournalComponent {
  private apiService = inject(ApiService);

  journalResource = resource({
    request: () => ({}),
    loader: async () => {
      const { result } = await this.apiService.get<JournalEntry[]>('/api/journal-entries');
      return (result as JournalEntry[] || []).filter((entry) => !entry.is_drawn_on_map);
    }
  });

  get journalEntries() {
    return this.journalResource.value() || [];
  }

  get isLoading() {
    return this.journalResource.isLoading();
  }

  async markAsDrawn(entry: JournalEntry) {
    // Optimistically update the resource value
    this.journalResource.set(this.journalEntries.filter(e => e.id !== entry.id));

    try {
      await this.apiService.put<JournalEntry>(`/api/journal-entries/${entry.id}`, {
        data: {
          ...entry,
          is_drawn_on_map: true,
        },
      });
    } catch (error) {
      // Restore previous state on error
      await this.journalResource.reload();
      console.error('Error updating journal entry:', error);
    }
  }
}
