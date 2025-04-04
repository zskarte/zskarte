import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { toSignal } from '@angular/core/rxjs-interop';

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
  private _snackBar = inject(MatSnackBar);
  isOnline = toSignal(this._session.observeIsOnline());
  isReadOnly = toSignal(this._state.observeIsReadOnly());

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
  openDisabled = false;
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

    effect(() => {
      const update = this.journal.lastUpdated();
      if (update) {
        //prevent show snackBar if it's a draw info update
        if (update.entry !== update.change && ('isDrawingOnMap' in update.change || 'isDrawnOnMap' in update.change)) {
          return;
        }
        //only show snackBar if message match the active filters
        const entry = update.entry;
        if (this.departmentControl.value && this.departmentControl.value !== entry.department) {
          return;
        }

        if ((this.triageFilter || this.outgoingFilter || this.decisionFilter) && !this.filterByState(entry)) {
          return;
        }

        if (this.keyMessageFilter && entry.isKeyMessage) {
          return;
        }

        if (this.openDisabled) {
          this._snackBar.open(`#${entry.messageNumber} ${entry.messageSubject}`, undefined, {
            duration: 5000,
          });
        } else {
          this._snackBar
            .open(`#${entry.messageNumber} ${entry.messageSubject}`, this.i18n.get('edit'), {
              duration: 5000,
            })
            .onAction()
            .subscribe(() => {
              this.selectEntry(entry);
            });
        }
      }
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
    //define special field/value to do the sort
    this.dataSourceFiltered.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'entryResponsibility':
          return this.getResponsibility(item);
        case 'entryStatus':
          return Object.values(JournalEntryStatus).indexOf(item[property]);
        default:
          return item[property];
      }
    };

    //define special sort handling/compare function
    const originalSortFn = this.dataSourceFiltered.sortData;
    this.dataSourceFiltered.sortData = (items: JournalEntry[], sort: MatSort) => {
      switch (sort.active) {
        case 'messageNumber':
          return items.sort((a, b) =>
            compareNegativeHigher(a.messageNumber, b.messageNumber, sort.direction === 'asc'),
          );
        default:
          return originalSortFn(items, sort);
      }
    };

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

  private filterByState(entry: JournalEntry) {
    return (
      (this.triageFilter && entry.entryStatus === JournalEntryStatus.AWAITING_TRIAGE) ||
      (this.outgoingFilter &&
        (entry.entryStatus === JournalEntryStatus.AWAITING_COMPLETION ||
          entry.entryStatus === JournalEntryStatus.AWAITING_MESSAGE)) ||
      (this.decisionFilter && entry.entryStatus === JournalEntryStatus.AWAITING_DECISION)
    );
  }

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
            (!(this.triageFilter || this.outgoingFilter || this.decisionFilter) || this.filterByState(item)),
        );
    } else {
      if (department) {
        filtered = filtered.filter((entry) => entry.department === department);
      }

      if (this.triageFilter || this.outgoingFilter || this.decisionFilter) {
        filtered = filtered.filter((entry) => this.filterByState(entry));
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

  close() {
    this.sidebarOpen = false;
    this.selectedJournalEntry.set(null);
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
    //the sort logic itself is done by mat-sort, no need for own logic
  }

  async selectEntry(entry: JournalEntry) {
    if (!this.sidebarOpen || !this.openDisabled) {
      this.selectedJournalEntry.set(entry);
      this.sidebarOpen = true;
    }
  }

  @HostListener('window:keydown.+', ['$event'])
  async pressPlus(event: Event) {
    if (this.sidebarOpen || this._state.getActiveView() !== 'journal') {
      return;
    }
    // While writing into a input, don't allow shortcuts
    if (['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    this.openJournalAddDialog();
  }

  openJournalAddDialog() {
    if (!this.sidebarOpen || !this.openDisabled) {
      this.selectedJournalEntry.set(null);
      this.journalFormComponent.addNew();
      this.sidebarOpen = true;
    }
  }

  async loadPdfDesignerComponent() {
    if (this.pdfDesignerComponent() === null) {
      const { PdfDesignerComponent } = await import('../pdf/pdf-designer/pdf-designer.component');
      this.pdfDesignerComponent.set(PdfDesignerComponent);
    }
  }

  async showPdfDesigner() {
    await this.loadPdfDesignerComponent();
    this.messagePdfTemplate.set(await this.journal.getTemplate());
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
      let templateToSave: object | null = newTemplate;
      const defaultTemplate = await this.journal.getDefaultTemplate();
      if (JSON.stringify(defaultTemplate) === JSON.stringify(newTemplate)) {
        //reset to default / empty the on saved
        templateToSave = null;
      }
      const { error, result } = await this._session.saveJournalEntryTemplate(templateToSave);
      if (error || !result) {
        this.messagePdfTemplate.set(newTemplate);
        InfoDialogComponent.showSaveErrorDialog(this._dialog, this.i18n, error);
      } else {
        this.designerActive.set(false);
      }
    } else {
      this.designerActive.set(false);
    }
  }

  @HostListener('window:keydown.Control.p', ['$event'])
  @HostListener('window:keydown.Meta.p', ['$event'])
  @HostListener('window:beforeprint', ['$event'])
  async onStartPrint(event: Event) {
    if (this._state.getActiveView() !== 'journal') {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    await this.export();
  }

  async export() {
    await this.journal.exportAsExcel(this.journal.data());
  }
}

function compareNegativeHigher(a: number, b: number, isAsc: boolean) {
  let value: number;
  if (a > 0 && b > 0) {
    value = a < b ? -1 : 1;
  } else if (a < 0 && b < 0) {
    //if both are negative it's inversed
    value = a < b ? 1 : -1;
  } else if (a < 0) {
    value = 1;
  } else {
    value = -1;
  }
  return value * (isAsc ? 1 : -1);
}
