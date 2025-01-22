import { Component, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { I18NService } from '../state/i18n.service';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JournalEntry } from './journal.types';
import { ApiService } from '../api/api.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-journal',
  imports: [
    MatTableModule,
    MatIconModule,
    MatExpansionModule,
    MatSidenavModule,
    MatButtonModule,
    MatSortModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatDividerModule,
    MatCheckboxModule,
    MatTabsModule,
    NgIf,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './journal.component.html',
  styleUrl: './journal.component.scss',
})
export class JournalComponent {
  i18n = inject(I18NService);
  private apiService = inject(ApiService);

  displayedColumns: string[] = ['message_number', 'message_subject', 'message_content', 'date_created', 'creator'];
  dataSource: JournalEntry[] = [];

  selectedJournalEntry: Partial<JournalEntry> | null = null;

  journalForm = new FormGroup({
    message_number: new FormControl(),
    sender: new FormControl(),
    creator: new FormControl(),
    communication_type: new FormControl(),
    communication_details: new FormControl(),
    message_subject: new FormControl(),
    message_content: new FormControl(),
    visum_decision_receiver: new FormControl(),
    date_created_date: new FormControl(),
    date_created_time: new FormControl(),
    decision: new FormControl(),
    status: new FormControl(),
  });

  editing = false;

  constructor() {
    this.loadJournalEntries();
  }

  async loadJournalEntries() {
    const { result } = await this.apiService.get('/api/journal-entries');
    this.dataSource = result;
  }

  async selectEntry(entry: JournalEntry) {
    this.selectedJournalEntry = entry;
    this.journalForm.patchValue({
      message_number: entry.message_number,
      sender: entry.sender,
      creator: entry.creator,
      communication_type: entry.communication_type,
      communication_details: entry.communication_details,
      message_subject: entry.message_subject,
      message_content: entry.message_content,
      visum_decision_receiver: entry.visum_decision_receiver,
      date_created_date: entry.date_created,
      date_created_time: entry.date_created,
      decision: entry.decision,
      status: entry.status,
    });
  }

  resetEntry() {
    this.selectedJournalEntry = null;
    this.editing = false;
  }

  openJournalAddDialog() {
    this.editing = true;

    this.selectedJournalEntry = {};

    this.journalForm.reset();
  }

  toggleEditing() {
    this.editing = !this.editing;
  }

  async save() {
    if (this.selectedJournalEntry?.id) {
      await this.apiService.put(`/api/journal-entries/${this.selectedJournalEntry.id}`, { data: this.selectedJournalEntry });
    } else {
      await this.apiService.post('/api/journal-entries', { data: this.selectedJournalEntry });
    }
    await this.loadJournalEntries();

    this.selectedJournalEntry = null;
    this.editing = false;
  }
}
