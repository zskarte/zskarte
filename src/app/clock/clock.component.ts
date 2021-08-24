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
