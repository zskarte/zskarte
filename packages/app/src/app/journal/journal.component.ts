import { Component, inject, resource } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatProgressSpinnerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './journal.component.html',
  styleUrl: './journal.component.scss',
})
export class JournalComponent implements AfterViewInit {
  i18n = inject(I18NService);
  private apiService = inject(ApiService);
  private sessionService = inject(SessionService);

  displayedColumns: string[] = [
    'messageNumber',
    'messageSubject',
    'messageContent',
    'dateMessage',
    'entryStatus',
    'isKeyMessage',
  ];
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
    keys: ['messageSubject', 'messageContent', 'decision'],
    ignoreLocation: true,
    threshold: 0.5,
  });
  selectedIndex = 0;

  selectedJournalEntry: JournalEntry | null = null;

  sidebarOpen = false;

  journalResource = resource({
    request: () => ({}),
    loader: async () => {
      const { result } = await this.apiService.get<JournalEntry[]>('/api/journal-entries');
      this.dataSource = result || [];
      this.dataSourceFiltered.data = this.dataSource;
      this.fuse.setCollection(this.dataSource);
      return result;
    },
  });

  journalForm = new FormGroup({
    messageNumber: new FormControl<string | number>('', { nonNullable: true }),
    sender: new FormControl('', { nonNullable: true }),
    creator: new FormControl('', { nonNullable: true }),
    communicationType: new FormControl('', { nonNullable: true }),
    communicationDetails: new FormControl('', { nonNullable: true }),
    messageSubject: new FormControl('', { nonNullable: true }),
    messageContent: new FormControl('', { nonNullable: true }),
    visumMessage: new FormControl('', { nonNullable: true }),
    department: new FormControl('', { nonNullable: true }),
    dateCreatedDate: new FormControl<Date>(new Date(), { nonNullable: true }),
    dateCreatedTime: new FormControl<Date>(new Date(), { nonNullable: true }),
    isKeyMessage: new FormControl(false, { nonNullable: true }),
    visumTriage: new FormControl('', { nonNullable: true }),
    dateTriage: new FormControl(),
    dateDecision: new FormControl(),
    visumDecider: new FormControl('', { nonNullable: true }),
    decision: new FormControl('', { nonNullable: true }),
    decisionReceiver: new FormControl('', { nonNullable: true }),
    entryStatus: new FormControl('awaiting_message', { nonNullable: true }),
    dateDecisionDelivered: new FormControl(),
    decisionSender: new FormControl('', { nonNullable: true }),
  });

  editing = false;

  constructor() {
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
          (this.triageFilter && entry.entryStatus === 'awaiting_triage') ||
          (this.outgoingFilter && entry.entryStatus === 'awaiting_completion') ||
          (this.decisionFilter && entry.entryStatus === 'awaiting_decision'),
      );
    }

    if (this.keyMessageFilter) {
      filtered = filtered.filter((entry) => entry.isKeyMessage);
    }

    if (searchTerm) {
      const results = this.fuse.search(searchTerm);
      filtered = results
        .filter((result) => result.score && result.score <= 0.5)
        .map((result) => result.item)
        .filter(
          (item) =>
            (!department || item.department === department) &&
            (!this.keyMessageFilter || item.isKeyMessage) &&
            (!(this.triageFilter || this.outgoingFilter || this.decisionFilter) ||
              (this.triageFilter && item.entryStatus === 'awaiting_triage') ||
              (this.outgoingFilter && item.entryStatus === 'awaiting_completion') ||
              (this.decisionFilter && item.entryStatus === 'awaiting_decision')),
        );
    }

    this.dataSourceFiltered.data = filtered;
  }

  async selectEntry(entry: JournalEntry) {
    this.selectedJournalEntry = entry;
    this.sidebarOpen = true;
    this.editing = false;
    this.selectedIndex = 0;

    this.journalForm.patchValue({
      ...entry,
      dateCreatedDate: new Date(),
      dateCreatedTime: new Date(),
    });
  }

  resetEntry() {
    this.selectedJournalEntry = null;
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

    this.journalForm.patchValue({});
  }

  async resetState() {
    this.journalForm.patchValue({
      entryStatus: 'awaiting_triage',
    });

    const { dateCreatedTime, dateCreatedDate, ...rest } = this.journalForm.value;

    await this.apiService.put<JournalEntry>(`/api/journal-entries/${this.selectedJournalEntry?.documentId}`, {
      data: {
        ...rest,
        dateMessage: new Date(
          (this.journalForm.value.dateCreatedDate as Date).setTime(
            this.journalForm.value.dateCreatedTime!.getTime(),
          ),
        ),
      },
    });

    await this.journalResource.reload();

    const entry = await this.apiService.get<JournalEntry>(
      `/api/journal-entries/${this.selectedJournalEntry?.documentId}`,
    );

    await this.selectEntry(entry.result as JournalEntry);
    this.selectedIndex = this.selectedIndex - 1;
  }

  async save(event: any) {
    const entryStatus = this.journalForm.value.entryStatus;
    if (event.submitter.name !== 'save') {
      if (entryStatus === 'awaiting_message') {
        this.journalForm.patchValue({ entryStatus: 'awaiting_triage' });
      } else if (entryStatus === 'awaiting_triage') {
        this.journalForm.patchValue({ entryStatus: 'awaiting_decision', dateTriage: new Date() });
      } else if (entryStatus === 'awaiting_decision') {
        this.journalForm.patchValue({ entryStatus: 'awaiting_completion', dateDecision: new Date() });
      } else {
        this.journalForm.patchValue({ entryStatus: 'completed', dateDecisionDelivered: new Date() });
      }
    }

    const operation = this.sessionService.getOperation();
    const organization = this.sessionService.getOrganization();

    try {
      const { dateCreatedTime, dateCreatedDate, ...rest } = this.journalForm.value;

      if (this.selectedJournalEntry?.documentId) {
        await this.apiService.put<JournalEntry>(`/api/journal-entries/${this.selectedJournalEntry.documentId}`, {
          data: {
            ...rest,
            operation: operation?.documentId,
            organization: organization?.documentId,
            date_message: new Date(
              (this.journalForm.value.dateCreatedDate as Date).setTime(
                this.journalForm.value.dateCreatedTime!.getTime(),
              ),
            ),
          },
        });
      } else {
        await this.apiService.post('/api/journal-entries', {
          data: {
            ...rest,
            operation: operation?.documentId,
            organization: organization?.documentId,
            date_message: new Date(
              (this.journalForm.value.dateCreatedDate as Date).setTime(
                this.journalForm.value.dateCreatedTime!.getTime(),
              ),
            ),
          },
        });
      }

      await this.journalResource.reload();

      const entry = await this.apiService.get<JournalEntry>(
        `/api/journal-entries/${this.selectedJournalEntry?.documentId}`,
      );

      await this.selectEntry(entry.result as JournalEntry);

      this.editing = false;

      this.selectedIndex = this.selectedIndex + 1;
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  }
}
