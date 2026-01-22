import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SessionService } from '../session.service';
import { OperationService } from '../operations/operation.service';

/**
 * Guard that redirects authenticated users with an operationId query param to /main/map.
 * Used on login and share routes to automatically navigate to the map after authentication.
 */
@Injectable({
  providedIn: 'root',
})
export class LoginRedirectGuard implements CanActivate {
  private _session = inject(SessionService);
  private _router = inject(Router);
  private _operationService = inject(OperationService);

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    const isAuthenticated = await firstValueFrom(this._session.observeAuthenticated());
    
    if (!isAuthenticated) {
      return true; // Allow access to login/share page if not authenticated
    }

    const operationId = route.queryParams['operationId'];
    if (operationId) {
      // Load the operation if not already set
      const currentOperation = this._session.getOperation();
      if (!currentOperation?.documentId || currentOperation.documentId !== operationId) {
        const operation = await this._operationService.getOperation(operationId, { 
          token: this._session.getToken() 
        });
        if (operation) {
          await this._session.setOperation(operation);
        }
      }

      // Redirect to map with preserved query params (except operationId)
      const queryParams: any = { ...route.queryParams };
      delete queryParams['operationId'];
      // Remove null/undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === null || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      return this._router.createUrlTree(['/main/map'], { queryParams });
    }

    // If authenticated but no operationId, redirect to map
    return this._router.parseUrl('/main/map');
  }
}
