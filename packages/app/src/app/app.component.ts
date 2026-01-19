import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { ShortcutService } from './shortcut/shortcut.service';
import { RouterModule, RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { MatTabsModule } from "@angular/material/tabs";
import {NgFor} from "@angular/common";
import { SessionService } from './session/session.service';
import { I18NService } from './state/i18n.service';
import { ZsMapStateService } from './state/state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterModule, MatTabsModule, NgFor],
})
export class AppComponent implements OnInit {
  i18n = inject(I18NService);
  private _shortcut = inject(ShortcutService);
  private _session = inject(SessionService);
  private _state = inject(ZsMapStateService);
  private _router = inject(Router);
  readonly journalAddressPreview = toSignal(this._state.observeJournalAddressPreview());
  readonly operationId = toSignal(this._session.observeOperationId());
  isHelpPage = signal(false);

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
    // Track if we're on the help page
    this._router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.url;
        this.isHelpPage.set(url === '/help' || url.startsWith('/help'));
      });
    // Check initial route
    const initialUrl = this._router.url;
    this.isHelpPage.set(initialUrl === '/help' || initialUrl.startsWith('/help'));
  }

  ngOnInit(): void {
    this.setSize();
  }

  @HostListener('window:resize')
  setSize(): void {
    this.height = document.documentElement?.clientHeight || window.innerHeight;
    this.width = window.innerWidth;
  }
}
