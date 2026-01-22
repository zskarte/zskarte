import { Routes } from '@angular/router';
import { OperationsComponent } from './session/operations/operations.component';
import { OperationGuard } from './session/operations/operation.guard';
import { SessionGuard, NoSessionGuard } from './session/session.guard';
import { LoginRedirectGuard } from './session/login/login-redirect.guard';
import { LoginComponent } from './session/login/login.component';
import { ShareComponent } from './session/share/share.component';
import { MainComponent } from './main/main.component';
import { HelpPageComponent } from './help/help-page.component';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [LoginRedirectGuard] },
  { path: 'operations', component: OperationsComponent, canActivate: [SessionGuard] },
  { path: 'main/:id', component: MainComponent, canActivate: [SessionGuard, OperationGuard] },
  { path: 'share/:accessToken', component: ShareComponent, canActivate: [LoginRedirectGuard] },
  { path: 'help', component: HelpPageComponent },
  { path: 'help/:slug', component: HelpPageComponent },
  { path: 'help/:parentSlug/:childSlug', component: HelpPageComponent },
  { path: '**', redirectTo: 'main/map' },
];
