import { Component, HostListener, inject } from '@angular/core';
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

  public logo = '';
  public localOperation = false;

  protected sidebarConfig = {
    [SidebarContext.Layers]: {
      showLogo: false,
      title: this.i18n.get('view'),
    },
    [SidebarContext.History]: {
      showLogo: false,
      title: this.i18n.get('history'),
    },
    [SidebarContext.Connections]: {
      showLogo: false,
      title: this.i18n.get('connections'),
    },
    [SidebarContext.Print]: {
      showLogo: false,
      title: this.i18n.get('print'),
    },
    [SidebarContext.SelectedFeature]: {
      showLogo: false,
      title: this.i18n.get('selectedFeature'),
    },
    [SidebarContext.Journal]: {
      showLogo: false,
      title: this.i18n.get('journal'),
    },
    [SidebarContext.JournalForm]: {
      showLogo: false,
      title: this.i18n.get('journal'),
      size: 'large'
    },
  };

  constructor() {
    this.logo = this.session.getLogo() ?? '';
    this.localOperation = this.session.getOperationId()?.startsWith('local-') ?? false;
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
