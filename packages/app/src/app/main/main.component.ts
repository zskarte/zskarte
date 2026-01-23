import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JournalComponent } from '../journal/journal.component';
import { MapComponent } from '../map/map.component';
import { ZsMapStateService } from '../state/state.service';

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

  constructor() {
    this._activatedRoute.params.subscribe((params) => {
      const view = params['id'];
      this.id.set(view);
      this._state.setActiveView(view);
    });
  }
}
