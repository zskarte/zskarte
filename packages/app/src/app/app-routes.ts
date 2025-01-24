import { Routes } from '@angular/router';
import { OperationsComponent } from './session/operations/operations.component';
import { OperationGuard } from './session/operations/operation.guard';
import { SessionGuard } from './session/session.guard';
import { LoginComponent } from './session/login/login.component';
import { ShareComponent } from './session/share/share.component';
import { MainComponent } from './main/main.component';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'operations', component: OperationsComponent, canActivate: [SessionGuard] },
  { path: 'main/:id', component: MainComponent, canActivate: [SessionGuard, OperationGuard] },
  { path: 'share/:accessToken', component: ShareComponent },
  { path: '**', redirectTo: 'main/map' },
];
