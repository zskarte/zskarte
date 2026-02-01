import { inject, Injectable, signal } from '@angular/core';
import { Router, NavigationEnd, UrlTree } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private _router = inject(Router);
  public readonly isHelpPage = signal(false);
  public readonly showLanguageSelector = signal(false);
  public readonly helpOriginUrl = signal<UrlTree | undefined>(undefined);

  constructor() {
    this._router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      // Track if we're on the help page
      if (this.isHelpPageUrl(url)) {
        if (!this.isHelpPage()) {
          this.isHelpPage.set(true);
          this.helpOriginUrl.set(this._router.currentNavigation()?.previousNavigation?.finalUrl);
        }
      } else {
        this.isHelpPage.set(false);
      }
      // Show language selector on login, operations and help pages, but not on main pages
      this.showLanguageSelector.set(this.isShowLanguageSelecorAllowUrl(url));
    });
    // Check initial route
    const initialUrl = this._router.url;
    this.isHelpPage.set(this.isHelpPageUrl(initialUrl));
    this.showLanguageSelector.set(this.isShowLanguageSelecorAllowUrl(initialUrl));
  }

  private isHelpPageUrl(url: string) {
    return url === '/help' || url.startsWith('/help/');
  }

  private isShowLanguageSelecorAllowUrl(url: string) {
    return url.includes('/login') || url.includes('/operations') || url.includes('/share/') || url.includes('/help');
  }

  goBackToHelpOrigin() {
    this._router.navigateByUrl(this.helpOriginUrl() || '/');
  }
}
