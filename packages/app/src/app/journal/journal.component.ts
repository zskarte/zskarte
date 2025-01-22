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
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JournalEntry } from './journal.types';
import { ApiService } from '../api/api.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { SessionService } from '../session/session.service';
import Fuse from 'fuse.js';

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
    MatSelectModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './journal.component.html',
  styleUrl: './journal.component.scss',
})
export class JournalComponent {
  i18n = inject(I18NService);
  private apiService = inject(ApiService);
  private sessionService = inject(SessionService);

  displayedColumns: string[] = ['message_number', 'message_subject', 'message_content', 'date_created', 'creator'];
  dataSource: JournalEntry[] = [];
  dataSourceFiltered: JournalEntry[] = [];
  searchControl = new FormControl('');
  departmentControl = new FormControl('');
  triageFilter = false;
  keyMessageFilter = false;
  outgoingFilter = false;
  private fuse: Fuse<JournalEntry> = new Fuse([], {
    includeScore: true,
    keys: ['message_subject', 'message_content', 'decision']
  });

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
    is_key_message: new FormControl(),
    decision: new FormControl(),
    status: new FormControl(),
  });

  editing = false;

  constructor() {
    this.loadJournalEntries();
    this.initializeSearch();
    this.initializeDepartmentFilter();
  }

  private initializeSearch() {
    this.searchControl.valueChanges.subscribe(searchTerm => {
      this.filterEntries(searchTerm, this.departmentControl.value);
    });
  }

  private initializeDepartmentFilter() {
    this.departmentControl.valueChanges.subscribe(department => {
      this.filterEntries(this.searchControl.value, department);
    });
  }

  toggleTriageFilter(event: any) {
    this.triageFilter = event.source.checked;
    this.filterEntries(this.searchControl.value, this.departmentControl.value);
  }

  toggleKeyMessageFilter(event: any) {
    this.keyMessageFilter = event.source.checked;
    this.filterEntries(this.searchControl.value, this.departmentControl.value);
  }

  toggleOutgoingFilter(event: any) {
    this.outgoingFilter = event.source.checked;
    this.filterEntries(this.searchControl.value, this.departmentControl.value);
  }

  private filterEntries(searchTerm: string | null, department: string | null) {
    let filtered = this.dataSource;

    if (department) {
      filtered = filtered.filter(entry => entry.department === department);
    }

    if (this.triageFilter) {
      filtered = filtered.filter(entry => entry.status === 'awaiting_triage');
    }

    if (this.keyMessageFilter) {
      filtered = filtered.filter(entry => entry.is_key_message === true);
    }

    if (this.outgoingFilter) {
      filtered = filtered.filter(entry => entry.status === 'awaiting_completion');
    }

    if (searchTerm) {
      const results = this.fuse.search(searchTerm);
      filtered = results.map(result => result.item).filter(item => 
        (!department || item.department === department) &&
        (!this.triageFilter || item.status === 'awaiting_triage') &&
        (!this.keyMessageFilter || item.is_key_message === true) &&
        (!this.outgoingFilter || item.status === 'awaiting_completion')
      );
    }

    this.dataSourceFiltered = filtered;
  }

  async loadJournalEntries() {
    const { result } = await this.apiService.get<JournalEntry[]>('/api/journal-entries');
    this.dataSource = result || [];
    this.dataSourceFiltered = this.dataSource;
    this.fuse.setCollection(this.dataSource);
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
      is_key_message: entry.is_key_message,
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

    this.journalForm.patchValue({
      message_number: '',
      sender: '',
      creator: '',
      communication_type: '',
      communication_details: '',
      message_subject: '',
      message_content: '',
      visum_decision_receiver: '',
      date_created_date: new Date(),
      date_created_time: new Date(),
      is_key_message: false,
      decision: '',
      status: null,
    });
  }

  toggleEditing() {
    this.editing = !this.editing;
  }

  async resetState() {
    this.journalForm.patchValue({
      status: 'awaiting_triage',
    });

    await this.apiService.put<JournalEntry>(`/api/journal-entries/${this.selectedJournalEntry?.id}`, {
      data: {
        ...this.journalForm.value,
      },
    });

    const currentEntry = this.dataSource.find((d) => d.id === this.selectedJournalEntry?.id);

    if (currentEntry) {
      await this.selectEntry(currentEntry);
    }
  }

  async save() {
    const operation = this.sessionService.getOperation();
    const organization = this.sessionService.getOrganization();

    try {
      if (this.selectedJournalEntry?.id) {
        await this.apiService.put<JournalEntry>(`/api/journal-entries/${this.selectedJournalEntry.id}`, {
          data: {
            ...this.journalForm.value,
            status: this.journalForm.value.status === 'awaiting_triage' ? 'awaiting_decision' : 'completed',
            operation: operation?.id,
            organization: organization?.id
          },
        });
      } else {
        await this.apiService.post<JournalEntry>('/api/journal-entries', { 
          data: {
            ...this.journalForm.value,
            operation: operation?.id,
            organization: organization?.id
          }
        });
      }

      await this.loadJournalEntries();

      const currentEntry = this.dataSource.find((d) => d.id === this.selectedJournalEntry?.id);
      if (currentEntry) {
        await this.selectEntry(currentEntry);
      }

      this.editing = false;
      this.selectedJournalEntry = null;
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  }

  protected readonly Date = Date;
}
