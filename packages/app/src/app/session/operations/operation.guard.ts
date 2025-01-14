import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SessionService } from '../session.service';

@Injectable({
  providedIn: 'root',
})
export class OperationGuard implements CanActivate {
  private _router = inject(Router);
  private _session = inject(SessionService);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this._session.getOperationId()) {
      const urlTree = this._router.parseUrl('/operations');
      urlTree.queryParams = route.queryParams;
      return urlTree;
    }
    return true;
  }
}
