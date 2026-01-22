import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JournalComponent } from '../journal/journal.component';
import { MapComponent } from '../map/map.component';
import { ZsMapStateService } from '../state/state.service';
import { SidebarService } from '../sidebar/sidebar.service';

@Component({
  selector: 'app-main',
  imports: [MapComponent, JournalComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  public id = signal('map');
  private _activatedRoute = inject(ActivatedRoute);
  private _state = inject(ZsMapStateService);
  private _sidebar = inject(SidebarService);
  private _previousView: string | undefined;

  constructor() {
    this._activatedRoute.params.subscribe((params) => {
      const view = params['id'];
      if (this._previousView && this._previousView !== view && (view === 'map' || view === 'journal')) {
        this._sidebar.close();
      }
      this._previousView = view;
      this.id.set(view);
      this._state.setActiveView(view);
    });
  }
}
