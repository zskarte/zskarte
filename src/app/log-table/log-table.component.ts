import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { I18NService } from '../i18n.service';

/*export interface PeriodicElement {
  id: string;
  date: string;
  group: string;
  sign: string;
  location: string;
  size: string;
  label: string;
  description: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {id: '1', date: '12.05.2019', group: 'Testgruppe', location:'', sign: 'Gefahr', label: 'Hydrogen', size: '1.0079', description: 'H'},
  {id: '2', date: '12.05.2019', group: 'Testgruppe', location:'', sign: 'Gefahr', label: 'Helium', size: '4.0026', description: 'He'},
  {id: '3', date: '12.05.2019', group: 'Testgruppe', location:'', sign: 'Gefahr', label: 'Lithium', size: '6.941', description: 'Li'},
  {id: '4', date: '12.05.2019', group: 'Testgruppe', location:'', sign: 'Gefahr', label: 'Beryllium', size: '9.0122', description: 'Be'},
  {id: '5', date: '12.05.2019', group: 'Testgruppe', location:'', sign: 'Gefahr', label: 'Boron', size: '10.811', description: 'B'},
  {id: '6', date: '12.05.2019', group: 'Testgruppe', location:'', sign: 'Gefahr', label: 'Carbon', size: '12.0107', description: 'C'},
  {id: '7', date: '12.05.2019', group: 'Testgruppe', location:'', sign: 'Gefahr', label: 'Nitrogen', size: '14.0067', description: 'N'},
  {id: '8', date: '12.05.2019', group: 'Testgruppe', location:'', sign: 'Gefahr', label: 'Oxygen', size: '15.9994', description: 'O'},
  {id: '9', date: '12.05.2019', group: 'Testgruppe', location:'', sign: 'Gefahr', label: 'Fluorine', size: '18.9984', description: 'F'},
  {id: '10', date: '12.05.2019', group: 'Testgruppe', location:'', sign: 'Gefahr', label: 'Neon', size: '20.1797', description: 'Ne'},
];*/

/**
 * @title Styling columns using their auto-generated column names
 */
@Component({
  selector: 'app-log-table',
  templateUrl: './log-table.component.html',
  styleUrls: ['./log-table.component.css'],
})
export class LogTableComponent {
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Array<{id:string,date:string,group:string,sign:string,location:string,size:string,label:string,description:string}>,
    public i18n: I18NService
  ) {}

  displayedColumns: string[] = [
    //'log-id',
    'log-date',
    'log-group',
    'log-sign',
    //'log-location',
    //'log-size',
    'log-label',
    'log-description'
  ];
  //dataSource = ELEMENT_DATA;

}