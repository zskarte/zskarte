import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JournalComponent } from '../journal/journal.component';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-main',
  imports: [MapComponent, JournalComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  public id = signal('map');
  private _activatedRoute = inject(ActivatedRoute);

  constructor() {
    this._activatedRoute.params.subscribe((params) => {
      this.id.set(params['id']);
    });
  }
}
