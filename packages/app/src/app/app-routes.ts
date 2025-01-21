import { Routes } from '@angular/router';
import { MapComponent } from './map/map.component';
import { OperationsComponent } from './session/operations/operations.component';
import { OperationGuard } from './session/operations/operation.guard';
import { SessionGuard } from './session/session.guard';
import { LoginComponent } from './session/login/login.component';
import { ShareComponent } from './session/share/share.component';
import { JournalComponent } from "./journal/journal.component";

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'operations', component: OperationsComponent, canActivate: [SessionGuard] },
  { path: 'map', component: MapComponent, canActivate: [SessionGuard, OperationGuard] },
  { path: 'journal', component: JournalComponent},
  { path: 'share/:accessToken', component: ShareComponent },
  { path: '**', redirectTo: 'map' },
];
