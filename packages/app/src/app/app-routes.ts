import { Routes } from '@angular/router';
import { OperationsComponent } from './session/operations/operations.component';
import { OperationGuard } from './session/operations/operation.guard';
import { SessionGuard } from './session/session.guard';
import { LoginRedirectGuard } from './session/login/login-redirect.guard';
import { LoginComponent } from './session/login/login.component';
import { ShareComponent } from './session/share/share.component';
import { MainComponent } from './main/main.component';
import { HelpPageComponent } from './help/help-page.component';
import { SidebarContext } from './sidebar/sidebar.interfaces';

const sidebarRoutes: Routes = [
  {
    path: SidebarContext.Menu,
    outlet: 'sidebar',
    canActivate: [SessionGuard, OperationGuard],
    loadComponent: () => import('./sidebar/sidebar-menu/sidebar-menu.component').then((c) => c.SidebarMenuComponent),
  },
  {
    path: SidebarContext.Layers,
    outlet: 'sidebar',
    canActivate: [SessionGuard, OperationGuard],
    loadComponent: () => import('./sidebar/sidebar/sidebar.component').then((c) => c.SidebarComponent),
  },
  {
    path: SidebarContext.Filters,
    outlet: 'sidebar',
    canActivate: [SessionGuard, OperationGuard],
    loadComponent: () =>
      import('./sidebar/sidebar-filters/sidebar-filters.component').then((c) => c.SidebarFiltersComponent),
  },
  {
    path: SidebarContext.Connections,
    outlet: 'sidebar',
    canActivate: [SessionGuard, OperationGuard],
    loadComponent: () =>
      import('./sidebar/sidebar-connections/sidebar-connections.component').then((c) => c.SidebarConnectionsComponent),
  },
  {
    path: SidebarContext.History,
    outlet: 'sidebar',
    canActivate: [SessionGuard, OperationGuard],
    loadComponent: () =>
      import('./sidebar/sidebar-history/sidebar-history.component').then((c) => c.SidebarHistoryComponent),
  },
  {
    path: SidebarContext.SelectedFeature,
    outlet: 'sidebar',
    canActivate: [SessionGuard, OperationGuard],
    loadComponent: () =>
      import('./selected-feature/selected-feature.component').then((c) => c.SelectedFeatureComponent),
  },
  {
    path: `${SidebarContext.SelectedFeature}/:selectedFeatureId`,
    outlet: 'sidebar',
    canActivate: [SessionGuard, OperationGuard],
    loadComponent: () =>
      import('./selected-feature/selected-feature.component').then((c) => c.SelectedFeatureComponent),
  },
  {
    path: SidebarContext.Print,
    outlet: 'sidebar',
    canActivate: [SessionGuard, OperationGuard],
    loadComponent: () => import('./sidebar/sidebar-print/sidebar-print.component').then((c) => c.SidebarPrintComponent),
  },
  {
    path: `${SidebarContext.Journal}`,
    outlet: 'sidebar',
    canActivate: [SessionGuard, OperationGuard],
    loadComponent: () =>
      import('./sidebar/sidebar-journal/sidebar-journal.component').then((c) => c.SidebarJournalComponent),
  },
  {
    path: `${SidebarContext.Journal}/:currentMessage`,
    outlet: 'sidebar',
    canActivate: [SessionGuard, OperationGuard],
    loadComponent: () =>
      import('./sidebar/sidebar-journal/sidebar-journal.component').then((c) => c.SidebarJournalComponent),
  },
  {
    path: `${SidebarContext.JournalForm}`,
    outlet: 'sidebar',
    data: {
      size: 'large',
    },
    canActivate: [SessionGuard, OperationGuard],
    loadComponent: () => import('./journal/journal-form/journal-form.component').then((c) => c.JournalFormComponent),
  },
  {
    path: `${SidebarContext.JournalForm}/:currentMessage`,
    outlet: 'sidebar',
    data: {
      size: 'large',
    },
    canActivate: [SessionGuard, OperationGuard],
    loadComponent: () => import('./journal/journal-form/journal-form.component').then((c) => c.JournalFormComponent),
  },
];

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [LoginRedirectGuard] },
  { path: 'operations', component: OperationsComponent, canActivate: [SessionGuard] },
  { path: 'main/:id', component: MainComponent, canActivate: [SessionGuard, OperationGuard] },
  { path: 'share/:accessToken', component: ShareComponent, canActivate: [LoginRedirectGuard] },
  { path: 'help', component: HelpPageComponent },
  { path: 'help/:slug', component: HelpPageComponent },
  { path: 'help/:parentSlug/:childSlug', component: HelpPageComponent },
  ...sidebarRoutes,
  { path: '**', redirectTo: 'main/map' },
];
