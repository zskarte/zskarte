import { Routes } from '@angular/router';
import { OperationsComponent } from './session/operations/operations.component';
import { OperationGuard } from './session/operations/operation.guard';
import { SessionGuard } from './session/session.guard';
import { LoginComponent } from './session/login/login.component';
import { ShareComponent } from './session/share/share.component';
import { MainComponent } from './main/main.component';
import { SidebarComponent } from './sidebar/sidebar/sidebar.component';
import { SidebarFiltersComponent } from './sidebar/sidebar-filters/sidebar-filters.component';
import { SidebarConnectionsComponent } from './sidebar/sidebar-connections/sidebar-connections.component';
import { SidebarHistoryComponent } from './sidebar/sidebar-history/sidebar-history.component';
import { SelectedFeatureComponent } from './selected-feature/selected-feature.component';
import { SidebarPrintComponent } from './sidebar/sidebar-print/sidebar-print.component';
import { SidebarContext } from './sidebar/sidebar.interfaces';
import { SidebarMenuComponent } from './sidebar/sidebar-menu/sidebar-menu.component';
import { SidebarJournalComponent } from './sidebar/sidebar-journal/sidebar-journal.component';
import { JournalFormComponent } from './journal/journal-form/journal-form.component';

const sidebarRoutes: Routes = [
  {
    path: SidebarContext.Menu,
    outlet: 'sidebar',
    component: SidebarMenuComponent,
  },
  {
    path: SidebarContext.Layers,
    outlet: 'sidebar',
    component: SidebarComponent,
  },
  {
    path: SidebarContext.Filters,
    outlet: 'sidebar',
    component: SidebarFiltersComponent,
  },
  {
    path: SidebarContext.Connections,
    outlet: 'sidebar',
    component: SidebarConnectionsComponent,
  },
  {
    path: SidebarContext.History,
    outlet: 'sidebar',
    component: SidebarHistoryComponent,
  },
  {
    path: SidebarContext.SelectedFeature,
    outlet: 'sidebar',
    component: SelectedFeatureComponent,
  },
  {
    path: `${SidebarContext.SelectedFeature}/:selectedFeatureId`,
    outlet: 'sidebar',
    component: SelectedFeatureComponent,
  },
  {
    path: SidebarContext.Print,
    outlet: 'sidebar',
    component: SidebarPrintComponent,
  },
  {
    path: `${SidebarContext.Journal}`,
    outlet: 'sidebar',
    component: SidebarJournalComponent,
  },
  {
    path: `${SidebarContext.Journal}/:currentMessage`,
    outlet: 'sidebar',
    component: SidebarJournalComponent,
  },
  {
    path: `${SidebarContext.JournalForm}`,
    outlet: 'sidebar',
    data: {
      size: 'large',
    },
    component: JournalFormComponent,
  },
  {
    path: `${SidebarContext.JournalForm}/:currentMessage`,
    outlet: 'sidebar',
    data: {
      size: 'large',
    },
    component: JournalFormComponent,
  },
];

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'operations', component: OperationsComponent, canActivate: [SessionGuard] },
  {
    path: 'main/:id',
    component: MainComponent,
    canActivate: [SessionGuard, OperationGuard],
  },
  { path: 'share/:accessToken', component: ShareComponent },
  ...sidebarRoutes,
  { path: '**', redirectTo: 'main/map' },
];
