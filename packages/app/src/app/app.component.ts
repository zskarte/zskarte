import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject } from '@angular/core';
import { ShortcutService } from './shortcut/shortcut.service';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatTabsModule } from "@angular/material/tabs";
import { SessionService } from './session/session.service';
import { I18NService } from './state/i18n.service';
import { ZsMapStateService } from './state/state.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { SidebarWrapperComponent } from './sidebar/sidebar-wrapper/sidebar-wrapper.component';
import { NavigationService } from './navigation/navigation.service';
import { VersionService } from 'src/version/version.service';
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
  private _shortcut = inject(ShortcutService);
  private _session = inject(SessionService);
  private _state = inject(ZsMapStateService);
  navigation = inject(NavigationService);
  private _version = inject(VersionService);
  readonly journalAddressPreview = toSignal(this._state.observeJournalAddressPreview());
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

  showLanguageSelector(): boolean {
    const currentUrl = this._router.url;
    // Show language selector on login and operations pages, but not on main pages
    return currentUrl.includes('/login') || currentUrl.includes('/operations') || currentUrl.includes('/share/');
  }
}
