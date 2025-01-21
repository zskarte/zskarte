import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class SessionGuard implements CanActivate {
  private _session = inject(SessionService);
  private _router = inject(Router);

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    const isAuthenticated = await firstValueFrom(this._session.observeAuthenticated());
    if (isAuthenticated) {
      return true;
    }
    const urlTree = this._router.parseUrl('/login');
    urlTree.queryParams = route.queryParams;
    return urlTree;
  }
}
