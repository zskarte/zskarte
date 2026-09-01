import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '../state/i18n.service';
import { SessionService } from '../session/session.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { AdminOrganizationsComponent } from './organizations/admin-organizations.component';
import { AdminOperationsComponent } from './operations/admin-operations.component';
import { AdminPermissionsComponent } from './permissions/admin-permissions.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    AdminOrganizationsComponent,
    AdminOperationsComponent,
    AdminPermissionsComponent,
  ],
})
export class AdminComponent {
  public i18n = inject(I18NService);
  public session = inject(SessionService);
  private _router = inject(Router);

  public backToOperations(): void {
    this._router.navigate(['/operations']);
  }
}
