import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { I18NService } from '../state/i18n.service';
import { JournalService } from '../journal/journal.service';
import { SidebarService } from '../sidebar/sidebar.service';
import { SidebarContext } from '../sidebar/sidebar.interfaces';
import { SearchService } from '../search/search.service';
import { ReplaceAllAddressTokensPipe } from "../search/replace-all-address-tokens.pipe";

@Component({
  selector: 'app-journal-draw-overlay',
  imports: [MatListModule, MatButtonModule, MatIconModule, CommonModule, ReplaceAllAddressTokensPipe],
  templateUrl: './journal-draw-overlay.component.html',
  styleUrl: './journal-draw-overlay.component.scss',
})
export class JournalDrawOverlayComponent {
  private _sidebar = inject(SidebarService);
  public journal = inject(JournalService);
  public i18n = inject(I18NService);
  public search = inject(SearchService);
  expanded = signal(true);
  entry = computed(() => this.journal.drawingEntry);

  constructor() {
    // Verwenden Sie effect() im Konstruktor
    effect(() => {
      //trigger when entry changes
      this.entry();
      //reset expanded
      this.expanded.set(true);
    });
  }

  toggleExpanded() {
    this.expanded.update((value) => !value);
  }

  async close(finished: boolean) {
    if (finished) {
      await this.journal.markAsDrawn(this.entry()!, true);
    } else {
      await this.journal.startDrawing(this.entry()!, false);
    }
    this._sidebar.open(SidebarContext.Journal);
  }
}
