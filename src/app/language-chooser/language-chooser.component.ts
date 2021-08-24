import { Component } from '@angular/core';
import { I18NService, LOCALES } from '../i18n.service';

@Component({
  selector: 'app-language-chooser',
  templateUrl: './language-chooser.component.html',
  styleUrls: ['./language-chooser.component.css'],
})
export class LanguageChooserComponent {
  locales: string[] = LOCALES;

  constructor(private i18n: I18NService) {}

  setLocale(locale: string) {
    this.i18n.locale = locale;
  }
}
