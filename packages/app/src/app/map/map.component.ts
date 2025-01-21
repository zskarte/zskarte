import { Component } from '@angular/core';
import { FloatingUIComponent } from '../floating-ui/floating-ui.component';
import { MapRendererComponent } from '../map-renderer/map-renderer.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  imports: [FloatingUIComponent, MapRendererComponent],
})
// skipcq: JS-0327
export class MapComponent {}
