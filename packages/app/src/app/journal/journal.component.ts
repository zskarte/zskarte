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
import {MatAccordion, MatExpansionModule, MatExpansionPanel} from "@angular/material/expansion";
import {MatDividerModule} from "@angular/material/divider";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatTimepickerModule} from "@angular/material/timepicker";
import {provideNativeDateAdapter} from "@angular/material/core";
import {FormsModule} from "@angular/forms";
import {JournalEntry} from "./journal.types";

const ELEMENT_DATA: JournalEntry[] = [];


@Component({
  selector: 'app-journal',
  imports: [
    MatTableModule,
    MatIconModule,
    MatExpansionPanel,
    MatExpansionModule,
    MatSidenavModule,
    MatButtonModule,
    MatSortModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatAccordion,
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
  displayedColumns: string[] = ['nr', 'subject', 'content', 'dateCreated', 'creator'];
  dataSource = ELEMENT_DATA;

  selectedJournalEntry: Partial<JournalEntry> | null = null;

  editing = false;

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
