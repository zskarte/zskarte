import { Component, ElementRef, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { JournalEntry } from '../../journal/journal.types';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { I18NService } from '../../state/i18n.service';
import { SidebarJournalEntryComponent } from '../sidebar-journal-entry/sidebar-journal-entry.component';
import { JournalService } from '../../journal/journal.service';
import { SidebarService } from '../sidebar.service';
import { ZsMapStateService } from 'src/app/state/state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  EmptyComponent,
  EmptyHeaderComponent,
  EmptyMediaComponent,
  EmptyTitleComponent,
  EmptyDescriptionComponent,
} from '../../ui/empty';
import { MatIconModule } from '@angular/material/icon';
import { BadgeComponent } from '../../badge/badge.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-sidebar-journal',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDividerModule,
    MatTabsModule,
    MatBadgeModule,
    MatIconModule,
    SidebarJournalEntryComponent,
    EmptyComponent,
    EmptyHeaderComponent,
    EmptyMediaComponent,
    EmptyTitleComponent,
    EmptyDescriptionComponent,
    BadgeComponent,
    MatPaginatorModule,
  ],
  templateUrl: './sidebar-journal.component.html',
  styleUrl: './sidebar-journal.component.scss',
})
export class SidebarJournalComponent {
  private _sidebar = inject(SidebarService);
  public journal = inject(JournalService);
  public i18n = inject(I18NService);
  private _state = inject(ZsMapStateService);
  private elementRef = inject(ElementRef);
  readonly journalEntries = this.journal.allData;
  readonly journalEntriesToDraw = computed(() => (this.journalEntries() || []).filter((entry) => !entry.isDrawnOnMap).sort((a, b) => a.messageNumber - b.messageNumber));
  readonly journalEntriesDrawn = computed(() => (this.journalEntries() || []).filter((entry) => entry.isDrawnOnMap).sort((a, b) => a.messageNumber - b.messageNumber));
  readonly isReadOnly = toSignal(this._state.observeIsReadOnly());
  currentMessageNumber: number | undefined;
  selectedIndex = 0;

  readonly pageSize = signal(10);
  readonly todoPageIndex = signal(0);
  readonly donePageIndex = signal(0);

  readonly paginatedToDraw = computed(() => {
    const start = this.todoPageIndex() * this.pageSize();
    return this.journalEntriesToDraw().slice(start, start + this.pageSize());
  });

  readonly paginatedDrawn = computed(() => {
    const start = this.donePageIndex() * this.pageSize();
    return this.journalEntriesDrawn().slice(start, start + this.pageSize());
  });

  constructor() {
    // Fetch all entries for sidebar display
    this.journal.fetchAllEntries();

    effect(() => {
      if (this.currentMessageNumber) {
        this.scrollToMessage(this.currentMessageNumber);
      }
    });
    effect(() => {
      const fragment = this._state.urlFragment();
      if (fragment?.startsWith('message=')) {
        const messageId = fragment.split('=')[1];
        const messageNumber = Number.parseInt(messageId);
        this.currentMessageNumber = messageNumber;

        const journalList = this.journal.data();
        const entry = (journalList || []).find((e) => e.messageNumber === messageNumber);
        if (entry) {
          this.selectedIndex = entry.isDrawnOnMap ? 1 : 0;
        }

        this.scrollToMessage(messageNumber);
      } else {
        this.currentMessageNumber = undefined;
      }
    });
  }

  onTodoPageChange(event: PageEvent) {
    this.todoPageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onDonePageChange(event: PageEvent) {
    this.donePageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  scrollToMessage(messageNumber: number) {
    const toDrawIndex = this.journalEntriesToDraw().findIndex((e) => e.messageNumber === messageNumber);
    if (toDrawIndex !== -1) {
      this.todoPageIndex.set(Math.floor(toDrawIndex / this.pageSize()));
    } else {
      const drawnIndex = this.journalEntriesDrawn().findIndex((e) => e.messageNumber === messageNumber);
      if (drawnIndex !== -1) {
        this.donePageIndex.set(Math.floor(drawnIndex / this.pageSize()));
      }
    }

    setTimeout(() => {
      const element = this.elementRef.nativeElement.querySelector(`[data-message-number="${messageNumber}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  startDrawing(entry: JournalEntry) {
    this._sidebar.close();
    this.journal.startDrawing(entry, true);
  }

  onPanelOpened(messageNumber: number) {
    this.currentMessageNumber = messageNumber;
  }

  onPanelClosed() {
    this.currentMessageNumber = undefined;
  }
}
