import { Component } from '@angular/core';
import { Filter } from '../drawingtools/drawingtools.component';
import { I18NService } from '../i18n.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
})
export class FilterComponent {
  filters: Filter[] = [
    {
      value: null,
      viewValue: this.i18n.get('noFilter'),
      color: 'white',
      textcolor: 'black',
    },
    {
      value: 'damage',
      viewValue: this.i18n.get('damage'),
      color: 'red',
      textcolor: 'white',
    },
    {
      value: 'danger',
      viewValue: this.i18n.get('danger'),
      color: 'orange',
      textcolor: 'black',
    },
    {
      value: 'resources',
      viewValue: this.i18n.get('resources'),
      color: 'blue',
      textcolor: 'white',
    },
  ];

  constructor(public i18n: I18NService) {}
}
