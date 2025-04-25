import { Component, ElementRef, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JournalEntry } from '../../journal/journal.types';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { I18NService } from '../../state/i18n.service';
import { SidebarJournalEntryComponent } from '../sidebar-journal-entry/sidebar-journal-entry.component';
import { JournalService } from '../../journal/journal.service';
import { SidebarService } from '../sidebar.service';
import { ZsMapStateService } from 'src/app/state/state.service';
import { toSignal } from '@angular/core/rxjs-interop';

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
  private _sidebar = inject(SidebarService);
  public journal = inject(JournalService);
  public i18n = inject(I18NService);
  private _state = inject(ZsMapStateService);
  readonly journalEntriesToDraw = signal<JournalEntry[]>([]);
  readonly journalEntriesDrawn = signal<JournalEntry[]>([]);
  readonly isReadOnly = toSignal(this._state.observeIsReadOnly());
  currentMessageNumber: number | undefined;

  constructor(private elementRef: ElementRef) {
    effect(() => {
      const journalList = this.journal.data();

      const toDraw = (journalList || []).filter((entry) => !entry.isDrawnOnMap);
      toDraw.sort((a, b) => a.messageNumber - b.messageNumber);
      this.journalEntriesToDraw.set(toDraw);

      const alreadyDrawn = (journalList || []).filter((entry) => entry.isDrawnOnMap);
      alreadyDrawn.sort((a, b) => b.messageNumber - a.messageNumber);
      this.journalEntriesDrawn.set(alreadyDrawn);

      if (this.currentMessageNumber) {
        this.scrollToMessage(this.currentMessageNumber);
      }
    });
    effect(() => {
      const fragment = this._state.urlFragment();
      if (fragment?.startsWith('message=')) {
        const messageId = fragment.split('=')[1];
        this.currentMessageNumber = Number.parseInt(messageId);

        this.scrollToMessage(this.currentMessageNumber);
      } else {
        this.currentMessageNumber = undefined;
      }
    });
  }

  scrollToMessage(messageNumber: number) {
    setTimeout(() => {
      const element = this.elementRef.nativeElement.querySelector(`[data-message-number="${messageNumber}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  startDrawing(entry: JournalEntry) {
    this._sidebar.close();
    this.journal.startDrawing(entry, true);
  }
}
