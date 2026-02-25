import { inject, Injectable, signal } from '@angular/core';
import { Router, NavigationEnd, UrlTree } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private _router = inject(Router);
  isHelpPage = signal(false);
  helpOriginUrl = signal<UrlTree | undefined>(undefined);

  constructor() {
    // Track if we're on the help page
    this._router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      if (url === '/help' || url.startsWith('/help/')) {
        if (!this.isHelpPage()) {
          this.isHelpPage.set(true);
          this.helpOriginUrl.set(this._router.currentNavigation()?.previousNavigation?.finalUrl);
        }
      } else {
        this.isHelpPage.set(false);
      }
    });
    // Check initial route
    const initialUrl = this._router.url;
    this.isHelpPage.set(initialUrl === '/help' || initialUrl.startsWith('/help/'));
  }

  goBackToHelpOrigin() {
    this._router.navigateByUrl(this.helpOriginUrl() || '/');
  }
}
