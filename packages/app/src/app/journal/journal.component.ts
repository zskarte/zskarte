import { Component, inject, resource, signal } from '@angular/core';
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
import { JournalEntry, JournalEntryStatus } from './journal.types';
import { ApiService } from '../api/api.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { SessionService } from '../session/session.service';
import Fuse from 'fuse.js';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { ViewChild } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

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

  JournalEntryStatus = JournalEntryStatus;

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
    request: () => ({
      operation: this.sessionService.getOperation()?.documentId,
    }),
    loader: async (params) => {
      const { result } = await this.apiService.get<JournalEntry[]>(
        `/api/journal-entries?operationId=${params.request.operation}`,
      );
      this.dataSource = result || [];
      this.dataSourceFiltered.data = this.dataSource;
      this.fuse.setCollection(this.dataSource);
      return result;
    },
  });

  journalForm = new FormGroup({
    messageNumber: new FormControl<string | number>('', {
      nonNullable: true,
      validators: [this.requiredStep(JournalEntryStatus.AWAITING_MESSAGE)],
    }),
    sender: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredStep(JournalEntryStatus.AWAITING_MESSAGE)],
    }),
    creator: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredStep(JournalEntryStatus.AWAITING_MESSAGE)],
    }),
    communicationType: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredStep(JournalEntryStatus.AWAITING_MESSAGE)],
    }),
    communicationDetails: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredStep(JournalEntryStatus.AWAITING_MESSAGE)],
    }),
    messageSubject: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredStep(JournalEntryStatus.AWAITING_MESSAGE)],
    }),
    messageContent: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredStep(JournalEntryStatus.AWAITING_MESSAGE)],
    }),
    visumMessage: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredStep(JournalEntryStatus.AWAITING_MESSAGE)],
    }),
    dateCreatedDate: new FormControl<Date>(new Date(), {
      nonNullable: true,
      validators: [this.requiredStep(JournalEntryStatus.AWAITING_MESSAGE)],
    }),
    dateCreatedTime: new FormControl<Date>(new Date(), {
      nonNullable: true,
      validators: [this.requiredStep(JournalEntryStatus.AWAITING_MESSAGE)],
    }),
    department: new FormControl<
      | 'politische-behoerde'
      | 'chef-fuehrungsorgan'
      | 'stabschef'
      | 'fb-lage'
      | 'fb-information'
      | 'fb-oeffentliche-sicherheit'
      | 'fb-schutz-rettung'
      | 'fb-gesundheit'
      | 'fb-logistik'
      | 'fb-infrastukturen'
      | null
    >(null, { nonNullable: true, validators: [this.requiredStep(JournalEntryStatus.AWAITING_TRIAGE)] }),
    isKeyMessage: new FormControl(false, { nonNullable: true }),
    visumTriage: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredStep(JournalEntryStatus.AWAITING_TRIAGE)],
    }),
    dateTriage: new FormControl<Date | null>(null, {
      validators: [this.requiredStep(JournalEntryStatus.AWAITING_TRIAGE)],
    }),
    dateDecision: new FormControl<Date | null>(null, {
      validators: [this.requiredStep(JournalEntryStatus.AWAITING_DECISION)],
    }),
    visumDecider: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredStep(JournalEntryStatus.AWAITING_DECISION)],
    }),
    decision: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredStep(JournalEntryStatus.AWAITING_DECISION)],
    }),
    decisionReceiver: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredStep(JournalEntryStatus.AWAITING_DECISION)],
    }),
    entryStatus: new FormControl<JournalEntryStatus>(JournalEntryStatus.AWAITING_MESSAGE, { nonNullable: true }),
    dateDecisionDelivered: new FormControl<Date | null>(null, {
      validators: [this.requiredStep(JournalEntryStatus.AWAITING_COMPLETION)],
    }),
    decisionSender: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredStep(JournalEntryStatus.AWAITING_COMPLETION)],
    }),
  });

  private combineDateAndTime(dateObj: Date, timeObj: Date) {
    const newDate = new Date(dateObj);
    newDate.setHours(timeObj.getHours());
    newDate.setMinutes(timeObj.getMinutes());
    newDate.setSeconds(timeObj.getSeconds());
    newDate.setMilliseconds(timeObj.getMilliseconds());
    return newDate;
  }

  constructor() {
    this.initializeSearch();
    this.initializeDepartmentFilter();
  }

  ngAfterViewInit() {
    this.dataSourceFiltered.sort = this.sort;
  }

  private requiredStep(status: JournalEntryStatus): ValidatorFn {
    return (control: AbstractControl) => {
      if (this.journalForm === undefined) return null;

      if (
        Object.values(JournalEntryStatus).indexOf(status) <=
        Object.values(JournalEntryStatus).indexOf(this.journalForm.controls.entryStatus.value)
      ) {
        return control.value ? null : { requiredStep: true };
      }

      return null;
    };
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
          (this.triageFilter && entry.entryStatus === JournalEntryStatus.AWAITING_TRIAGE) ||
          (this.outgoingFilter && entry.entryStatus === JournalEntryStatus.AWAITING_COMPLETION) ||
          (this.decisionFilter && entry.entryStatus === JournalEntryStatus.AWAITING_DECISION),
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
              (this.triageFilter && item.entryStatus === JournalEntryStatus.AWAITING_TRIAGE) ||
              (this.outgoingFilter && item.entryStatus === JournalEntryStatus.AWAITING_COMPLETION) ||
              (this.decisionFilter && item.entryStatus === JournalEntryStatus.AWAITING_DECISION)),
        );
    }

    this.dataSourceFiltered.data = filtered;
  }

  sortData(sort: Sort) {
    const data = this.dataSourceFiltered.data.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSourceFiltered.data = data;
      return;
    }

    this.dataSourceFiltered.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'messageNumber':
          return compare(a.messageNumber, b.messageNumber, isAsc);
        case 'dateMessage':
          return compare(a.dateMessage, b.dateMessage, isAsc);
        default:
          return 0;
      }
    });
  }

  async selectEntry(entry: JournalEntry) {
    this.selectedJournalEntry = entry;
    this.sidebarOpen = true;
    this.selectedIndex =
      entry.entryStatus === JournalEntryStatus.AWAITING_MESSAGE ? 0
      : entry.entryStatus === JournalEntryStatus.AWAITING_TRIAGE ? 1
      : entry.entryStatus === JournalEntryStatus.AWAITING_DECISION ? 2
      : 3;

    this.journalForm.patchValue({
      ...entry,
      dateCreatedDate: entry.dateMessage,
      dateCreatedTime: entry.dateMessage,
    });

    for (const control of Object.values(this.journalForm.controls)) {
      control.setErrors(null);
    }
  }

  resetEntry() {
    this.selectedJournalEntry = null;
    this.sidebarOpen = false;
    this.selectedIndex = 0;
  }

  openJournalAddDialog() {
    this.sidebarOpen = true;
    this.journalForm.reset();
  }

  async resetState() {
    if (this.journalForm.value.entryStatus === JournalEntryStatus.AWAITING_TRIAGE) {
      this.journalForm.patchValue({
        entryStatus: JournalEntryStatus.AWAITING_MESSAGE,
      });
    } else {
      this.journalForm.patchValue({
        entryStatus: JournalEntryStatus.AWAITING_TRIAGE,
      });
    }

    const { dateCreatedTime, dateCreatedDate, ...rest } = this.journalForm.value;

    await this.apiService.put<JournalEntry>(`/api/journal-entries/${this.selectedJournalEntry?.documentId}`, {
      data: {
        ...rest,
        dateMessage: this.combineDateAndTime(dateCreatedDate!, dateCreatedTime!),
      },
    });

    await this.journalResource.reload();

    const entry = await this.apiService.get<JournalEntry>(
      `/api/journal-entries/${this.selectedJournalEntry?.documentId}`,
    );

    await this.selectEntry(entry.result as JournalEntry);
  }

  async save() {
    const entryStatus = this.journalForm.controls.entryStatus.value;

    if (entryStatus === JournalEntryStatus.AWAITING_TRIAGE) {
      this.journalForm.patchValue({ dateTriage: new Date() });
    } else if (entryStatus === JournalEntryStatus.AWAITING_DECISION) {
      this.journalForm.patchValue({ dateDecision: new Date() });
    } else {
      this.journalForm.patchValue({ dateDecisionDelivered: new Date() });
    }

    Object.values(this.journalForm.controls).forEach((c) => c.updateValueAndValidity());
    if (!this.journalForm.valid) {
      return;
    }

    if (entryStatus === JournalEntryStatus.AWAITING_MESSAGE) {
      this.journalForm.patchValue({ entryStatus: JournalEntryStatus.AWAITING_TRIAGE });
    } else if (entryStatus === JournalEntryStatus.AWAITING_TRIAGE) {
      this.journalForm.patchValue({ entryStatus: JournalEntryStatus.AWAITING_DECISION });
    } else if (entryStatus === JournalEntryStatus.AWAITING_DECISION) {
      this.journalForm.patchValue({ entryStatus: JournalEntryStatus.AWAITING_COMPLETION });
    } else {
      this.journalForm.patchValue({ entryStatus: JournalEntryStatus.COMPLETED });
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
            dateMessage: this.combineDateAndTime(dateCreatedDate!, dateCreatedTime!),
          },
        });
      } else {
        const { result } = await this.apiService.post('/api/journal-entries', {
          data: {
            ...rest,
            operation: operation?.documentId,
            organization: organization?.documentId,
            dateMessage: this.combineDateAndTime(dateCreatedDate!, dateCreatedTime!),
          },
        });

        this.selectedJournalEntry = { documentId: result.documentId } as JournalEntry;
      }

      await this.journalResource.reload();

      const entry = await this.apiService.get<JournalEntry>(
        `/api/journal-entries/${this.selectedJournalEntry?.documentId}`,
      );

      await this.selectEntry(entry.result as JournalEntry);
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  }
}

function compare(a: any, b: any, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
