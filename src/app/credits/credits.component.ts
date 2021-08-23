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

import { Component, OnInit } from '@angular/core';
import { SharedStateService } from '../shared-state.service';
import { I18NService } from '../i18n.service';
import { getZSOById, ZSO } from '../entity/zso';

@Component({
  selector: 'app-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.css'],
})
export class CreditsComponent implements OnInit {
  constructor(
    public i18n: I18NService,
    private sharedState: SharedStateService
  ) {}

  zso: ZSO = null;

  ngOnInit() {
    this.sharedState.session.subscribe((s) => {
      if (s) {
        this.zso = getZSOById(s.zsoId);
      }
    });
  }
}
