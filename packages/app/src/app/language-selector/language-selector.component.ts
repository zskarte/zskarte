import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { I18NService } from '../state/i18n.service';
import { SessionService } from '../session/session.service';
import { Locale, LOCALES } from '@zskarte/types';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
})
export class LanguageSelectorComponent {
  i18n = inject(I18NService);
  session = inject(SessionService);

  locales: Locale[] = LOCALES;
  currentLocale$: Observable<Locale>;

  constructor() {
    // Create an observable that tracks locale changes
    this.currentLocale$ = this.session.observeLocale();
  }

  setLocale(locale: Locale): void {
    this.session.setLocale(locale);
    console.log('Language changed to:', locale); // Debug log
  }

  getCurrentLocale(): Locale {
    return this.session.getLocale();
  }
}