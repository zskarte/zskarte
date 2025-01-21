import {Component, inject} from '@angular/core';
import {MatTableModule} from "@angular/material/table";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import {NgIf} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {I18NService} from "../state/i18n.service";
import {MatSortModule} from "@angular/material/sort";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDialog} from "@angular/material/dialog";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatDividerModule} from "@angular/material/divider";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatTimepickerModule} from "@angular/material/timepicker";
import {provideNativeDateAdapter} from "@angular/material/core";
import {FormsModule} from "@angular/forms";
import {JournalEntry} from "./journal.types";
import {ApiService} from "../api/api.service";

const ELEMENT_DATA: JournalEntry[] = [];

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
    NgIf,
    FormsModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './journal.component.html',
  styleUrl: './journal.component.scss'
})
export class JournalComponent {
  i18n = inject(I18NService);
  private dialog = inject(MatDialog);
  private apiService = inject(ApiService);
  
  displayedColumns: string[] = ['message_number', 'message_subject', 'message_content', 'date_created', 'creator'];
  dataSource: JournalEntry[] = [];

  selectedJournalEntry: Partial<JournalEntry> | null = null;

  editing = false;

  constructor() {
    this.loadJournalEntries();
  }

  async loadJournalEntries() {
    const { result } = await this.apiService.get('/api/journal-entries');
    this.dataSource = result.map(entry => ({
      ...entry,
      createdAt: new Date(entry.createdAt),
      date_created: new Date(entry.date_created),
      date_visum_decision_deliverer: entry.date_visum_decision_deliverer ? new Date(entry.date_visum_decision_deliverer) : undefined,
      date_visum_decision_receiver: entry.date_visum_decision_receiver ? new Date(entry.date_visum_decision_receiver) : undefined, 
      date_visum_message: entry.date_visum_message ? new Date(entry.date_visum_message) : undefined,
      date_visum_triage: entry.date_visum_triage ? new Date(entry.date_visum_triage) : undefined,
      publishedAt: new Date(entry.publishedAt),
      updatedAt: new Date(entry.updatedAt)
    }));
  }

  async selectEntry(entry: JournalEntry) {
    console.log(entry);
    this.selectedJournalEntry = entry;
  }

  resetEntry() {
    this.selectedJournalEntry = null;
  }

  openJournalAddDialog() {
    this.editing = true;

    this.selectedJournalEntry = {
      message_number: 0,
      message_subject: '',
      message_content: '',
      date_created: new Date(),
      creator: ''
    };
  }

  toggleEditing() {
    this.editing = !this.editing;
  }

  save() {

  }
}
