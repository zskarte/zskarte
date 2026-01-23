import { Component, ElementRef, effect, inject, signal, input, computed, linkedSignal } from '@angular/core';
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
} from '../../empty/empty.component';
import { MatIconModule } from '@angular/material/icon';
import { BadgeComponent } from '../../badge/badge.component';
import { SidebarContext } from '../sidebar.interfaces';

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
  ],
  templateUrl: './sidebar-journal.component.html',
  styleUrl: './sidebar-journal.component.scss',
})
export class SidebarJournalComponent {
  private _sidebar = inject(SidebarService);
  public journal = inject(JournalService);
  public i18n = inject(I18NService);
  private _state = inject(ZsMapStateService);
  readonly journalEntriesToDraw = signal<JournalEntry[]>([]);
  readonly journalEntriesDrawn = signal<JournalEntry[]>([]);
  readonly isReadOnly = toSignal(this._state.observeIsReadOnly());

  currentMessage = input<string>();
  protected currentMessageNumber = computed(() => {
    const param = this.currentMessage();
    return param && !isNaN(+param) ? +param : undefined;
  });

  readonly selectedTabIndex = linkedSignal({
    source: this.currentMessageNumber,
    computation: (next, prev) => {
      // don't change on deselection
      if (next === undefined) {
        return prev?.value;
      }

      const drawn = this.journalEntriesDrawn();
      if (drawn.some((t) => t.messageNumber === next)) {
        return 1;
      }
      return 0;
    },
  });

  constructor(private elementRef: ElementRef) {
    effect(() => {
      const journalList = this.journal.data();

      const toDraw = (journalList || []).filter((entry) => !entry.isDrawnOnMap);
      toDraw.sort((a, b) => a.messageNumber - b.messageNumber);
      this.journalEntriesToDraw.set(toDraw);

      const alreadyDrawn = (journalList || []).filter((entry) => entry.isDrawnOnMap);
      alreadyDrawn.sort((a, b) => a.messageNumber - b.messageNumber);
      this.journalEntriesDrawn.set(alreadyDrawn);
      const messageNumber = this.currentMessageNumber();
      if (messageNumber) {
        this.scrollToMessage(messageNumber);
      }
    });
  }

  scrollToMessage(messageNumber: number) {
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

  onPanelOpened(messageNumber: number | undefined) {
    void this._sidebar.open(SidebarContext.Journal, messageNumber?.toString());
  }

  onPanelClosed() {
    void this._sidebar.open(SidebarContext.Journal, 'null');
  }
}
