import { Component } from '@angular/core';
import {MatList, MatListItem} from "@angular/material/list";

@Component({
  selector: 'app-journal-sidebar',
  imports: [MatList, MatListItem],
  templateUrl: './journal-sidebar.component.html',
  styleUrl: './journal-sidebar.component.scss'
})
export class JournalSidebarComponent {

}
