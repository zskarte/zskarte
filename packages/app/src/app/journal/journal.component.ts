import { Component, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { I18NService } from '../state/i18n.service';
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
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ViewChild } from '@angular/core';
import { AfterViewInit } from '@angular/core';

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
    MatChipsModule,
    MatButtonToggleModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './journal.component.html',
  styleUrl: './journal.component.scss',
})
export class JournalComponent implements AfterViewInit {
  i18n = inject(I18NService);
  private apiService = inject(ApiService);
  private sessionService = inject(SessionService);

  displayedColumns: string[] = ['message_number', 'message_subject', 'message_content', 'date_message', 'entry_status', 'is_key_message'];
  dataSource: JournalEntry[] = [];
  dataSourceFiltered: MatTableDataSource<JournalEntry> = new MatTableDataSource();
  @ViewChild(MatSort) sort!: MatSort;
  searchControl = new FormControl('');
  departmentControl = new FormControl('');
  triageFilter = false;
  keyMessageFilter = false;
  outgoingFilter = false;
  decisionFilter = false;
  private fuse: Fuse<JournalEntry> = new Fuse([], {
    includeScore: true,
    // these fields are used for the search
    keys: ['message_subject', 'message_content', 'decision'],
    ignoreLocation: true,
    threshold: 0.5
  });
  selectedIndex = 0;

  selectedJournalEntryId: number | null = null;

  sidebarOpen = false;

  journalForm = new FormGroup({
    message_number: new FormControl<string | number>('', {nonNullable: true}),
    sender: new FormControl('', {nonNullable: true}),
    creator: new FormControl('', {nonNullable: true}),
    communication_type: new FormControl('', {nonNullable: true}),
    communication_details: new FormControl('', {nonNullable: true}),
    message_subject: new FormControl('', {nonNullable: true}),
    message_content: new FormControl('', {nonNullable: true}),
    visum_message: new FormControl('', {nonNullable: true}),
    visum_decision_receiver: new FormControl('', {nonNullable: true}),
    department: new FormControl('', {nonNullable: true}),
    date_created_date: new FormControl<Date>(new Date(), {nonNullable: true}),
    date_created_time: new FormControl<Date>(new Date(), {nonNullable: true}),
    is_key_message: new FormControl(false, {nonNullable: true}),
    visum_triage: new FormControl('', {nonNullable: true}),
    date_triage: new FormControl(),
    date_decision: new FormControl(),
    visum_decider: new FormControl('', {nonNullable: true}),
    decision: new FormControl('', {nonNullable: true}),
    decision_receiver: new FormControl('', {nonNullable: true}),
    visum_decision_deliverer: new FormControl('', {nonNullable: true}),
    entry_status: new FormControl('awaiting_message', {nonNullable: true}),
    date_decision_delivered: new FormControl(),
    decision_sender: new FormControl('', {nonNullable: true}),
  });

  editing = false;

  constructor() {
    this.loadJournalEntries();
    this.initializeSearch();
    this.initializeDepartmentFilter();
  }

  ngAfterViewInit() {
    this.dataSourceFiltered.sort = this.sort;
  }

  private initializeSearch() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filterEntries(searchTerm, this.departmentControl.value);
    });
  }

  private initializeDepartmentFilter() {
    this.departmentControl.valueChanges.subscribe((department) => {
      this.filterEntries(this.searchControl.value, department);
    });
  }

  toggleTriageFilter(event: any) {
    this.triageFilter = event.source.checked;
    this.filterEntries(this.searchControl.value, this.departmentControl.value);
  }

  toggleKeyMessageFilter(event: any) {
    console.log('toggleKeyMessageFilter', event);
    this.keyMessageFilter = event.selected;
    this.filterEntries(this.searchControl.value, this.departmentControl.value);
  }

  toggleOutgoingFilter(event: any) {
    this.outgoingFilter = event.source.checked;
    this.filterEntries(this.searchControl.value, this.departmentControl.value);
  }

  toggleDecisionFilter(event: any) {
    this.decisionFilter = event.source.checked;
    this.filterEntries(this.searchControl.value, this.departmentControl.value);
  }

  private filterEntries(searchTerm: string | null, department: string | null) {
    let filtered = this.dataSource;

    if (department) {
      filtered = filtered.filter((entry) => entry.department === department);
    }

    if (this.triageFilter || this.outgoingFilter || this.decisionFilter) {
      filtered = filtered.filter(
        (entry) =>
          (this.triageFilter && entry.entry_status === 'awaiting_triage') ||
          (this.outgoingFilter && entry.entry_status === 'awaiting_completion') ||
          (this.decisionFilter && entry.entry_status === 'awaiting_decision'),
      );
    }

    if (this.keyMessageFilter) {
      filtered = filtered.filter((entry) => entry.is_key_message);
    }

    if (searchTerm) {
      const results = this.fuse.search(searchTerm);
      filtered = results
        .filter(result => result.score && result.score <= 0.5)
        .map((result) => result.item)
        .filter(
          (item) =>
            (!department || item.department === department) &&
            (!this.keyMessageFilter || item.is_key_message) &&
            (!(this.triageFilter || this.outgoingFilter || this.decisionFilter) ||
              (this.triageFilter && item.entry_status === 'awaiting_triage') ||
              (this.outgoingFilter && item.entry_status === 'awaiting_completion') ||
              (this.decisionFilter && item.entry_status === 'awaiting_decision')),
        );
    }

    this.dataSourceFiltered.data = filtered;
  }

  async loadJournalEntries() {
    console.log('loadJournalEntries');
    const { result } = await this.apiService.get<JournalEntry[]>('/api/journal-entries');
    this.dataSource = result || [];
    this.dataSourceFiltered.data = this.dataSource;
    this.fuse.setCollection(this.dataSource);
  }

  async selectEntry(entry: JournalEntry) {
    this.selectedJournalEntryId = entry.id;
    this.sidebarOpen = true;
    this.editing = false;
    this.selectedIndex = 0;

    this.journalForm.patchValue({
      ...entry,
      date_created_date: new Date(),
      date_created_time: new Date(),
    });
  }

  resetEntry() {
    this.selectedJournalEntryId = null;
    this.sidebarOpen = false;
    this.editing = false;
    this.selectedIndex = 0;
  }

  openJournalAddDialog() {
    this.editing = true;
    this.sidebarOpen = true;
    this.journalForm.reset();
  }

  toggleEditing() {
    this.editing = !this.editing;
    this.sidebarOpen = false;
    this.journalForm.reset();
  }

  async resetState() {
    this.journalForm.patchValue({
      entry_status: 'awaiting_triage',
    });

    await this.apiService.put<JournalEntry>(`/api/journal-entries/${this.selectedJournalEntryId}`, {
      data: {
        ...this.journalForm.value,
        date_message: new Date((this.journalForm.value.date_created_date as Date).setTime(this.journalForm.value.date_created_time!.getTime())),
      },
    });

    await this.loadJournalEntries();

    const currentEntry = this.dataSource.find((d) => d.id === this.selectedJournalEntryId);

    if (currentEntry) {
      await this.selectEntry(currentEntry);
      this.selectedIndex = this.selectedIndex - 1;
    }
  }

  async save(event: any) {
    const entry_status = this.journalForm.value.entry_status;
    if (event.submitter.name !== 'save') {
      if (entry_status === 'awaiting_message') {
        this.journalForm.patchValue({ entry_status: 'awaiting_triage' });
      } else if (entry_status === 'awaiting_triage') {
        this.journalForm.patchValue({ entry_status: 'awaiting_decision', date_triage: new Date() });
      } else if (entry_status === 'awaiting_decision') {
        this.journalForm.patchValue({ entry_status: 'awaiting_completion', date_decision: new Date() });
      } else {
        this.journalForm.patchValue({ entry_status: 'completed', date_decision_delivered: new Date() });
      }
    }

    const operation = this.sessionService.getOperation();
    const organization = this.sessionService.getOrganization();

    try {
      if (this.selectedJournalEntryId) {
        await this.apiService.put<JournalEntry>(`/api/journal-entries/${this.selectedJournalEntryId}`, {
          data: {
            ...this.journalForm.value,
            operation: operation?.id,
            organization: organization?.id,
            date_message: new Date((this.journalForm.value.date_created_date as Date).setTime(this.journalForm.value.date_created_time!.getTime())),
          },
        });
      } else {
        const resp = await this.apiService.post('/api/journal-entries', {
          data: {
            ...this.journalForm.value,
            operation: operation?.id,
            organization: organization?.id,
            date_message: new Date((this.journalForm.value.date_created_date as Date).setTime(this.journalForm.value.date_created_time!.getTime())),
          },
        });

        this.selectedJournalEntryId = resp.result.id;
      }

      await this.loadJournalEntries();

      const currentEntry = this.dataSource.find((d) => d.id === this.selectedJournalEntryId);
      if (currentEntry) {
        await this.selectEntry(currentEntry);
      }

      this.editing = false;
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  }
}
