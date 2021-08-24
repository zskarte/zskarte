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
import { PreferencesService } from '../preferences.service';

@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.css'],
})
export class ClockComponent implements OnInit {
  historyDate = null;

  sessionId:string;
  sessionZsoId:string;
  timeOffset:number = PreferencesService.guestSessionTimeout;
  doCheckTimeout:number = 0;
  sessionTimeLeft:string;
  constructor(
    public i18n: I18NService,
    private sharedState: SharedStateService,
    private preferences: PreferencesService,
  ) {
    this.sharedState.historyDate.subscribe((s) => {
      this.historyDate = s && s !== 'now' ? new Date(s) : null;
      this.redefine();
    });
  }
  now: Date;

  ngOnInit() {
    this.update();
  }

  refreshSessionData() {
    const session = this.sharedState.getCurrentSession();
    this.sessionId = session.uuid;
    this.sessionZsoId = session.zsoId;
    this.doCheckTimeout = session.zsoId == 'zso_guest' && session.start != null ? (new Date(session.start)).getTime() + this.timeOffset : 0;
    this.sharedState.sessionOutdated.next(false);
  }

  redefine() {
    this.now = this.historyDate ? this.historyDate : new Date();
    if(this.sessionId != this.preferences.getLastSessionId() || this.sessionZsoId != this.preferences.getLastZsoId()) {
      this.refreshSessionData();
    }
    if(this.doCheckTimeout != 0) {
      const sessionSecondsLeft:number = Math.floor((this.doCheckTimeout - this.now.getTime()) / 1000);
      if(sessionSecondsLeft > 0) {
        this.sessionTimeLeft = sessionSecondsLeft > 60 ? Math.floor(sessionSecondsLeft / 60) + 'm'  : sessionSecondsLeft + 's';
      } else {
        this.sessionTimeLeft = this.i18n.get('sessionOverdue'); // 'Overdue!';
        if(!this.sharedState.sessionOutdated.value) {
          this.sharedState.sessionOutdated.next(true);
        }
      }
    }
  }

  update() {
    this.redefine();
    setTimeout(() => this.update(), 1000);
  }
}
