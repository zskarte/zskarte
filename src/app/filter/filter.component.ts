/*
 * Copyright © 2018-2020 ZSO Bern Plus / PCi Fribourg
 *
 * This file is part of Zivilschutzkarte 2.
 *
 * Zivilschutzkarte 2 is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * Zivilschutzkarte 2 is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along with
 * Zivilschutzkarte 2.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 */

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
