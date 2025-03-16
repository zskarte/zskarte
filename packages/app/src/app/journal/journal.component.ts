import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule, NgComponentOutlet } from '@angular/common';
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
import { ActivatedRoute, Router } from '@angular/router';
import { JournalService } from './journal.service';
import { JournalFormComponent } from './journal-form/journal-form.component';
import { firstValueFrom } from 'rxjs';
import { SessionService } from '../session/session.service';
import { InfoDialogComponent } from '../info-dialog/info-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ZsMapStateService } from '../state/state.service';
import { debounce } from '../helper/debounce';
import { IZsJournalFilter } from '../../../../types/state/interfaces';

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
    NgComponentOutlet,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './journal.component.html',
  styleUrl: './journal.component.scss',
})
export class JournalComponent implements AfterViewInit {
  @ViewChild(JournalFormComponent) journalFormComponent!: JournalFormComponent;
  i18n = inject(I18NService);
  journal = inject(JournalService);
  private _session = inject(SessionService);
  private _state = inject(ZsMapStateService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private _dialog = inject(MatDialog);

  DepartmentValues = DepartmentValues;
  JournalEntryStatus = JournalEntryStatus;

  displayedColumns: string[] = [
    'messageNumber',
    'messageSubject',
    'messageContent',
    'dateMessage',
    'entryResponsibility',
    'entryStatus',
    'isKeyMessage',
    'map',
    'print',
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

  designerActive = signal(false);
  pdfDesignerComponent = signal<any>(null);
  messagePdfTemplate = signal<object | null>(null);
  messagePdfDefaultTemplate = signal<object | null>(null);
  pdfDesignerInputs = computed(() => ({
    template: this.messagePdfTemplate(),
    defaultTemplate: this.messagePdfDefaultTemplate(),
    templateName: this.i18n.get('journalEntryTemplate'),
  }));
  @ViewChild(NgComponentOutlet) componentOutlet!: NgComponentOutlet;

  constructor() {
    this.initializeSearch();
    this.initializeDepartmentFilter();

    effect(() => {
      //effect is auto reevaluated wenn journal.data() is changed (by angular magic)
      this.dataSource = this.journal.data() || [];
      this.dataSourceFiltered.data = this.dataSource;
      this.fuse.setCollection(this.dataSource);
      this.filterEntries(this.searchControl.value, this.departmentControl.value);
    });

    //open journal entry by url messageNumber param
    firstValueFrom(this._route.queryParams).then(async (queryParams) => {
      if (queryParams['messageNumber']) {
        try {
          const messageNumber = queryParams['messageNumber'];
          const messageNumberInt = parseInt(messageNumber);
          const entry = await this.journal.getByNumber(messageNumberInt);
          if (entry) {
            this.selectEntry(entry);
          }
        } catch {
          //ignore invalid operationId param
        }
      }
    });
  }

  ngAfterViewInit() {
    this.dataSourceFiltered.sort = this.sort;
    this._state.observeJournalSort().subscribe((sortConf) => {
      if (this.dataSourceFiltered?.sort) {
        this.sort.sortChange.emit(sortConf);
        this.dataSourceFiltered.sort.active = sortConf.active;
        this.dataSourceFiltered.sort.direction = sortConf.direction;
      }
    });

    this._state.observeJournalFilter().subscribe((filter) => {
      this.departmentControl.setValue(filter.department);
      this.triageFilter = filter.triageFilter;
      this.outgoingFilter = filter.outgoingFilter;
      this.decisionFilter = filter.decisionFilter;
      this.keyMessageFilter = filter.keyMessageFilter;
      this.filterEntries(this.searchControl.value, filter.department);
    });
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

  private _debouncedPersistFilter = debounce((filter: IZsJournalFilter) => {
    this._state.setJournalFilter(filter);
  }, 5000);

  private filterEntries(searchTerm: string | null, department: string | null) {
    let filtered = this.dataSource;

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
    } else {
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
    }

    this._debouncedPersistFilter({
      department,
      triageFilter: this.triageFilter,
      outgoingFilter: this.outgoingFilter,
      decisionFilter: this.decisionFilter,
      keyMessageFilter: this.keyMessageFilter,
    });

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

  async print(event: Event, entry: JournalEntry) {
    event.stopPropagation();
    const button = (event.target as HTMLElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    await this.journal.print(entry);
    setTimeout(() => {
      if (button) {
        button.disabled = false;
      }
    }, 1000);
  }

  private _debouncedPersistSort = debounce((sort: Sort) => {
    this._state.setJournalSort(sort);
  }, 5000);

  sortData(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }

    this._debouncedPersistSort(sort);

    const data = this.dataSourceFiltered.data.slice();
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

  async loadPdfDesignerComponent() {
    if (this.pdfDesignerComponent() === null) {
      const { PdfDesignerComponent } = await import('../pdf/pdf-designer/pdf-designer.component');
      this.pdfDesignerComponent.set(PdfDesignerComponent);
    }
  }

  async showPdfDesigner() {
    await this.loadPdfDesignerComponent();
    this.messagePdfTemplate.set(this.journal.getTemplate());
    this.messagePdfDefaultTemplate.set(await this.journal.getDefaultTemplate());
    this.designerActive.set(true);

    setTimeout(() => {
      if (this.componentOutlet) {
        const instance = this.componentOutlet.componentInstance;
        if (instance) {
          if ('save' in instance) {
            instance.save.subscribe((newTemplate: object | null) => {
              this.updateMessagePdfTemplate(newTemplate);
            });
          }
        }
      }
    });
  }

  async updateMessagePdfTemplate(newTemplate: object | null) {
    if (newTemplate) {
      let saved: boolean;
      const defaultTemplate = await this.journal.getDefaultTemplate();
      if (JSON.stringify(defaultTemplate) === JSON.stringify(newTemplate)) {
        //reset to default / empty the on saved
        saved = await this._session.saveJournalEntryTemplate(null);
      } else {
        saved = await this._session.saveJournalEntryTemplate(newTemplate);
      }
      if (saved) {
        this.designerActive.set(false);
      } else {
        this.messagePdfTemplate.set(newTemplate);
        InfoDialogComponent.showErrorDialog(this._dialog, this.i18n.get('errorSaving'));
      }
    } else {
      this.designerActive.set(false);
    }
  }
}

function compare(a: any, b: any, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
