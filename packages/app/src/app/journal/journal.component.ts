import {Component, inject} from '@angular/core';
import {MatTableModule} from "@angular/material/table";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import {NgForOf, NgIf} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {I18NService} from "../state/i18n.service";
import {MatSortModule} from "@angular/material/sort";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDialog} from "@angular/material/dialog";
import {MatAccordion, MatExpansionModule, MatExpansionPanel} from "@angular/material/expansion";
import {MatDividerModule} from "@angular/material/divider";
import {JournalCreateDialogComponent} from "../journal-create-dialog/journal-create-dialog.component";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatTimepickerModule} from "@angular/material/timepicker";
import {provideNativeDateAdapter} from "@angular/material/core";

export interface JournalEntry {
  id: string;
  nr: number;
  subject: string;
  content: string;
  dateCreated: Date;
  creator: string;
}

const ELEMENT_DATA: JournalEntry[] = [
  {id: "1", nr: 1, subject: 'Baum ungestürzt', content: 'Ein Baum ist im Gantrisch umgestürzt. Leider wurde dabei ein Haus getroffen und Bewohner eingeschlossen.', dateCreated: new Date(), creator: 'Pascal'},
  {id: "2", nr: 2, subject: 'Feuer im Busch', content: 'Ein Busch hat Feuer gefangen und brennt lichterloh. Es ist anzunehmen, dass sich das Feuer auf den umliegenden Wald ausbreiten wird.', dateCreated: new Date(), creator: 'Pascal'},
];


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
    NgForOf,
    MatFormFieldModule,
    MatInputModule,
    MatAccordion,
    MatDatepickerModule,
    MatTimepickerModule,
    MatDividerModule,
    NgIf,
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

  selectedJournalEntry: JournalEntry | null = null;

  editing = false;

  async selectEntry(entry: JournalEntry) {
    console.log(entry);
    this.selectedJournalEntry = entry;
  }

  resetEntry() {
    this.selectedJournalEntry = null;
  }

  openJournalAddDialog() {
    this.dialog.open(JournalCreateDialogComponent);
  }

  toggleEditing() {
    this.editing = !this.editing;
  }

  save() {

  }
}
