import { Component, effect, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { I18NService } from '../state/i18n.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DepartmentValues, JournalEntry, JournalEntryStatus } from './journal.types';
import Fuse from 'fuse.js';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { ViewChild } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { JournalService } from './journal.service';
import { JournalFormComponent } from './journal-form/journal-form.component';

@Component({
  selector: 'app-journal',
  imports: [
    MatTableModule,
    MatIconModule,
    MatSidenavModule,
    MatButtonModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    CommonModule,
    JournalFormComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './journal.component.html',
  styleUrl: './journal.component.scss',
})
export class JournalComponent implements AfterViewInit {
  @ViewChild(JournalFormComponent) journalFormComponent!: JournalFormComponent;
  i18n = inject(I18NService);
  journal = inject(JournalService);
  private _router = inject(Router);

  DepartmentValues = DepartmentValues;

  displayedColumns: string[] = [
    'messageNumber',
    'messageSubject',
    'messageContent',
    'dateMessage',
    'entryResponsibility',
    'entryStatus',
    'isKeyMessage',
    'map',
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

  sidebarOpen = false;
  selectedJournalEntry = signal<JournalEntry | null>(null);

  constructor() {
    this.initializeSearch();
    this.initializeDepartmentFilter();

    effect(() => {
      //effect is auto reevaluated wenn journal.data() is changed (by angular magic)
      this.dataSource = this.journal.data() || [];
      this.dataSourceFiltered.data = this.dataSource;
      this.fuse.setCollection(this.dataSource);
    });
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
          (this.outgoingFilter &&
            (entry.entryStatus === JournalEntryStatus.AWAITING_COMPLETION ||
              entry.entryStatus === JournalEntryStatus.AWAITING_MESSAGE)) ||
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
              (this.outgoingFilter &&
                (item.entryStatus === JournalEntryStatus.AWAITING_COMPLETION ||
                  item.entryStatus === JournalEntryStatus.AWAITING_MESSAGE)) ||
              (this.decisionFilter && item.entryStatus === JournalEntryStatus.AWAITING_DECISION)),
        );
    }

    this.dataSourceFiltered.data = filtered;
  }

  getResponsibility(entry: JournalEntry) {
    switch (entry.entryStatus) {
      case JournalEntryStatus.AWAITING_MESSAGE:
        return entry.visumMessage;
      case JournalEntryStatus.AWAITING_DECISION:
        return this.i18n.get(entry.department ?? 'allDepartments');
      default:
        return this.i18n.get(`journalEntryResponsibility_${entry.entryStatus}`);
    }
  }

  openMapClick(event: Event, entry: JournalEntry) {
    event.stopPropagation();
    this._router.navigate(['/main/map'], { fragment: `message=${entry.messageNumber}` });
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
    this.selectedJournalEntry.set(entry);
    this.sidebarOpen = true;
  }

  openJournalAddDialog() {
    this.selectedJournalEntry.set(null);
    this.journalFormComponent.addNew();
    this.sidebarOpen = true;
  }
}

function compare(a: any, b: any, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
