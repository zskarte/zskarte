import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api/api.service';
import { SessionService } from '../session.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
})
export class ShareComponent {
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);
  private _api = inject(ApiService);
  private _session = inject(SessionService);

  constructor() {
    this._activatedRoute.params.subscribe(async (params) => {
      const queryParams = await firstValueFrom(this._activatedRoute.queryParams);
      // In embedded mode the share session must stay ephemeral, so unlinking later still shows
      // the user's full list of operations instead of just the (now unlinked) shared one.
      await this._session.shareLogin(params['accessToken'], { ephemeral: queryParams['embedded'] != null });
      
      const isAuthenticated = await firstValueFrom(this._session.observeAuthenticated());
      if (isAuthenticated) {
        const navQueryParams: any = { ...queryParams };
        delete navQueryParams['operationId'];
        Object.keys(navQueryParams).forEach(key => {
          if (navQueryParams[key] === null || navQueryParams[key] === undefined) {
            delete navQueryParams[key];
          }
        });
        await this._router.navigate(['/main/map'], { queryParams: navQueryParams });
      }
    });
  }
}
