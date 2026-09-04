import { ChangeDetectionStrategy, Component, HostListener, inject, OnInit } from '@angular/core';
import { ShortcutService } from './shortcut/shortcut.service';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { SessionService } from './session/session.service';
import { I18NService } from './state/i18n.service';
import { ZsMapStateService } from './state/state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { SidebarWrapperComponent } from './sidebar/sidebar-wrapper/sidebar-wrapper.component';
import { NavigationService } from './navigation/navigation.service';
import { VersionService } from './version/version.service';
import { LanguageSelectorComponent } from './language-selector/language-selector.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterModule, MatTabsModule, SidebarWrapperComponent, LanguageSelectorComponent],
})
export class AppComponent implements OnInit {
  i18n = inject(I18NService);
  navigation = inject(NavigationService);
  navLinks = [
    {
      label: 'map',
      link: '/main/map',
    },
    {
      label: 'journal',
      link: '/main/journal',
    },
  ];
  height = window.innerHeight;
  width = window.innerWidth;
  private _shortcut = inject(ShortcutService);
  private _session = inject(SessionService);
  readonly operationId = toSignal(this._session.observeOperationId());
  private _state = inject(ZsMapStateService);
  readonly journalAddressPreview = toSignal(this._state.observeJournalAddressPreview());
  private _version = inject(VersionService);

  constructor() {
    this._version.initialize();
    this._shortcut.initialize();
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
