import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { ShortcutService } from './shortcut/shortcut.service';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatTabsModule } from "@angular/material/tabs";
import {NgFor} from "@angular/common";
import { SessionService } from './session/session.service';
import { AsyncPipe } from '@angular/common';
import { I18NService } from './state/i18n.service';
import { ZsMapStateService } from './state/state.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterModule, MatTabsModule, NgFor, AsyncPipe],
})
export class AppComponent implements OnInit {
  i18n = inject(I18NService);
  private _shortcut = inject(ShortcutService);
  private _session = inject(SessionService);
  private _state = inject(ZsMapStateService);
  readonly journalAddressPreview = toSignal(this._state.observeJournalAddressPreview());
  readonly isHistoryMode = toSignal(this._state.observeIsHistoryMode());
  readonly operationId = toSignal(this._session.observeOperationId());
  

  navLinks = [
    {

      label: 'map',
      link: '/main/map',
    }, {
      label: 'journal',
      link: '/main/journal'
    }
  ];


  height = window.innerHeight;
  width = window.innerWidth;

  constructor() {
    this._shortcut.initialize();
  }

  ngOnInit(): void {
    this.setSize();
  }

  @HostListener('window:resize', ['$event'])
  setSize(): void {
    this.height = document.documentElement?.clientHeight || window.innerHeight;
    this.width = window.innerWidth;
  }
}
