import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { I18NService } from '../state/i18n.service';
import { SessionService } from '../session/session.service';
import { DEFAULT_LOCALE, Locale, LOCALES } from '@zskarte/types';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
})
export class LanguageSelectorComponent {
  i18n = inject(I18NService);
  session = inject(SessionService);

  locales: Locale[] = LOCALES;
  currentLocale = toSignal(this.session.observeLocale(), {initialValue: DEFAULT_LOCALE});

  setLocale(locale: Locale): void {
    this.session.setLocale(locale);
  }
}