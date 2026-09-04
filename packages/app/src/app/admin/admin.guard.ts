import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  private _session = inject(SessionService);
  private _router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (this._session.isAdmin()) {
      return true;
    }
    const urlTree = this._router.parseUrl('/operations');
    urlTree.queryParams = route.queryParams;
    return urlTree;
  }
}
