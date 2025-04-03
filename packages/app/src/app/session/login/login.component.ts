import { Component, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { getResponsiveImageSource } from 'src/app/helper/strapi-utils';
import { ApiService } from '../../api/api.service';
import { SessionService } from '../session.service';
import { ALLOW_OFFLINE_ACCESS_KEY, GUEST_USER_IDENTIFIER, GUEST_USER_PASSWORD } from '../userLogic';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { I18NService } from '../../state/i18n.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { StackComponent } from '../../stack/stack.component';
import { TextDividerComponent } from '../../text-divider/text-divider.component';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { IZso, IZsMapOrganization } from '@zskarte/types';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StackComponent,
    TextDividerComponent,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class LoginComponent implements OnDestroy {
  session = inject(SessionService);
  i18n = inject(I18NService);
  private _api = inject(ApiService);
  private _dialog = inject(MatDialog);
  private router = inject(Router);

  public selectedOrganization?: IZso = undefined;
  public password = '';
  public organizations = new BehaviorSubject<IZso[]>([]);
  public filteredOrganizations = new BehaviorSubject<IZso[]>([]);
  public isLoginWithCodeEnabled = false;
  public joinCode = '';
  public isOnline = true;
  public hasGuestUser = false;
  public allowOfflineAccess = localStorage.getItem(ALLOW_OFFLINE_ACCESS_KEY);
  private _ngUnsubscribe = new Subject<void>();

  constructor() {
    this.session
      .observeIsOnline()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((isOnline) => {
        this.isOnline = isOnline;
      });
  }

  async ngOnInit() {
    const { error, result } = await this._api.get<IZsMapOrganization[]>('/api/organizations/forlogin');
    if (error || !result) return;
    const orgs: IZso[] = [];
    for (const org of result) {
      if (org.users?.length > 0 && org.users[0]?.username) {
        if (org.users[0].username === 'zso_guest') {
          this.hasGuestUser = true;
          continue;
        }
        const responsiveImageSource = getResponsiveImageSource(org.logo);
        const newOrg: IZso = {
          name: org.name,
          identifier: org.users[0].username,
          logoSrc: responsiveImageSource?.src,
          logoSrcSet: responsiveImageSource?.srcSet,
        };
        orgs.push(newOrg);
        if (this.selectedOrganization) continue;
      }
      this.organizations.next(orgs);
      this.filteredOrganizations.next(orgs);
    }
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  filterControl = new FormControl();

  filterOrganizations() {
    const currentFiltered = this.organizations.value.filter((option) =>
      option.name.toLowerCase().includes(this.filterControl.value.toLowerCase()),
    );
    if (currentFiltered.length === 0 && this.selectedOrganization) {
      currentFiltered.push(this.selectedOrganization);
    }
    this.filteredOrganizations.next(currentFiltered);
  }

  // skipcq: JS-0105
  public nameProperty(zso: IZso) {
    return zso?.name;
  }

  public onSelectOrg(event: MatAutocompleteSelectedEvent) {
    this.selectedOrganization = event.option.value;
  }

  public onCloseAutocomplete() {
    if (this.selectedOrganization?.name === this.filterControl.value?.name) return;
    if (!this.filterControl.value) return;
    this.filterControl.setValue(this.selectedOrganization);
  }

  public async login(): Promise<void> {
    if (this.isLoginWithCodeEnabled) {
      const joinLink = `share/${this.joinCode}`;
      await this.router.navigateByUrl(joinLink);
    } else {
      await this.session.login({ identifier: this.selectedOrganization?.identifier ?? '', password: this.password });
    }
  }

  public guestLogin(): void {
    const confirmation = this._dialog.open(ConfirmationDialogComponent, {
      data: this.i18n.get('deletionNotification'),
    });
    confirmation.afterClosed().subscribe(async (res) => {
      if (res) {
        await this.session.login({ identifier: GUEST_USER_IDENTIFIER, password: GUEST_USER_PASSWORD });
      }
    });
  }

  public workLocal(): void {
    const confirmation = this._dialog.open(ConfirmationDialogComponent, {
      data: this.i18n.get('localNotification'),
    });
    confirmation.afterClosed().subscribe((res) => {
      if (res) {
        this.session.startWorkLocal();
      }
    });
  }
}
