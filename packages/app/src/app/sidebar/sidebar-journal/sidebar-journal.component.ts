import { Component, OnInit, inject, resource } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JournalEntry } from '../../journal/journal.types';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { I18NService } from '../../state/i18n.service';
import { SidebarJournalEntryComponent } from '../sidebar-journal-entry/sidebar-journal-entry.component';
import { ActivatedRoute } from '@angular/router';
import { JournalService } from '../../journal/journal.service';
import { SidebarService } from '../sidebar.service';

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
export class SidebarJournalComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private _sidebar = inject(SidebarService);
  public journal = inject(JournalService);
  i18n = inject(I18NService);
  currentMessageNumber: number | undefined;

  ngOnInit() {
    this.route.fragment.subscribe((fragment) => {
      if (fragment?.startsWith('message=')) {
        const messageId = fragment.split('=')[1];
        this.currentMessageNumber = parseInt(messageId);
      }
    });
  }

  get journalEntriesToDraw() {
    return (this.journal.data() || []).filter((entry) => !entry.isDrawnOnMap);
  }

  get journalEntriesDrawn() {
    return (this.journal.data() || []).filter((entry) => entry.isDrawnOnMap);
  }

  startDrawing(entry: JournalEntry) {
    this._sidebar.close();
    this.journal.startDrawing(entry, true);
  }
}
