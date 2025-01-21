import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api/api.service';
import { IAuthResult } from '@zskarte/types';
import { SessionService } from '../session.service';

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
      try {
        const accessToken = params['accessToken'];
        if (accessToken) {
          const response = await this._api.post<IAuthResult>('/api/accesses/auth/token', { accessToken }, { preventAuthorization: true });
          if (!response.result?.jwt) {
            throw new Error('Could not fetch token');
          }
          await this._session.updateJWT(response.result?.jwt);
          return;
        }
      } catch {
        // do nothing
      }

      await this._router.navigate(['login'], { queryParamsHandling: 'preserve' });
    });
  }
}
