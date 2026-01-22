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

@Injectable({
  providedIn: 'root',
})
export class NoSessionGuard implements CanActivate {
  private _session = inject(SessionService);
  private _router = inject(Router);

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    const isAuthenticated = await firstValueFrom(this._session.observeAuthenticated());
    // If authenticated but no operationId in query params, redirect to map
    // Otherwise let LoginRedirectGuard handle the redirect with operationId
    if (isAuthenticated && !route.queryParams['operationId']) {
      return this._router.parseUrl('/main/map');
    }
    return true;
  }
}
