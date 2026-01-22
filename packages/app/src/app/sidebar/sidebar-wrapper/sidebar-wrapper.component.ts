import { Component, effect, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { I18NService } from '../../state/i18n.service';
import { SessionService } from '../../session/session.service';
import { ZsMapStateService } from '../../state/state.service';
import { SidebarService } from '../sidebar.service';
import { SidebarContext } from '../sidebar.interfaces';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-sidebar-wrapper',
  templateUrl: './sidebar-wrapper.component.html',
  styleUrl: './sidebar-wrapper.component.scss',
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterOutlet],
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

  constructor() {
    this.logo = this.session.getLogo() ?? '';
    this.localOperation = this.session.getOperationId()?.startsWith('local-') ?? false;

    effect(() => {
      const sidebarContext = this.sidebar.context();
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
