import { Component, HostListener, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { I18NService } from '../../state/i18n.service';
import { SessionService } from '../../session/session.service';
import { ZsMapStateService } from '../../state/state.service';
import { SidebarService } from '../sidebar.service';
import { SidebarContext } from '../sidebar.interfaces';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SidebarHistoryComponent } from '../sidebar-history/sidebar-history.component';
import { SidebarConnectionsComponent } from '../sidebar-connections/sidebar-connections.component';
import { SidebarMenuComponent } from '../sidebar-menu/sidebar-menu.component';
import { SidebarPrintComponent } from '../sidebar-print/sidebar-print.component';
import { SidebarJournalComponent } from '../sidebar-journal/sidebar-journal.component';
import { SelectedFeatureComponent } from '../../selected-feature/selected-feature.component';
import { takeUntil, Subject } from 'rxjs';

@Component({
  selector: 'app-sidebar-wrapper',
  templateUrl: './sidebar-wrapper.component.html',
  styleUrl: './sidebar-wrapper.component.scss',
  imports: [
    AsyncPipe,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    SidebarComponent,
    SidebarHistoryComponent,
    SidebarConnectionsComponent,
    SidebarMenuComponent,
    SidebarPrintComponent,
    SidebarJournalComponent,
    SelectedFeatureComponent,
  ],
})
export class SidebarWrapperComponent {
  i18n = inject(I18NService);
  sidebar = inject(SidebarService);
  session = inject(SessionService);
  private _state = inject(ZsMapStateService);

  SidebarContext = SidebarContext;

  public showLogo = true;
  public sidebarTitle = '';
  public logo = '';
  public localOperation = false;

  private _ngUnsubscribe = new Subject<void>();

  constructor() {
    this.logo = this.session.getLogo() ?? '';
    this.localOperation = this.session.getOperationId()?.startsWith('local-') ?? false;
    
    this.sidebar.observeContext()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(sidebarContext => {
        switch (sidebarContext) {
          case SidebarContext.Layers:
            this.showLogo = false;
            this.sidebarTitle = this.i18n.get('view');
            break;
          case SidebarContext.History:
            this.showLogo = false;
            this.sidebarTitle = this.i18n.get('history');
            break;
          case SidebarContext.Connections:
            this.showLogo = false;
            this.sidebarTitle = this.i18n.get('connections');
            break;
          case SidebarContext.Print:
            this.showLogo = false;
            this.sidebarTitle = this.i18n.get('print');
            break;
          case SidebarContext.SelectedFeature:
            this.showLogo = false;
            this.sidebarTitle = this.i18n.get('selectedFeature');
            break;
          case SidebarContext.Journal:
            this.showLogo = false;
            this.sidebarTitle = this.i18n.get('journal');
            break;
          default:
            this.showLogo = true;
            this.sidebarTitle = this.session.getOperationName() ?? '';
            break;
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    // Only handle escape on non-map views
    // Map view has its own escape handler in FloatingUIComponent with additional checks
    if (this._state.getActiveView() === 'map') {
      return;
    }
    this.sidebar.close();
  }
}
