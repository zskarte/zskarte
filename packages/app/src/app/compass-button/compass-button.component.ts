import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';
import { MapRendererService } from '../map-renderer/map-renderer.service';
import { I18NService } from '../state/i18n.service';

@Component({
  selector: 'app-compass-button',
  templateUrl: './compass-button.component.html',
  styleUrls: ['./compass-button.component.scss'],
  imports: [MatButtonModule, AsyncPipe],
})
export class CompassButtonComponent {
  private renderer = inject(MapRendererService);
  public i18n = inject(I18NService);

  rotation$ = this.renderer.observeRotation();

  resetRotation(): void {
    this.renderer.resetRotation();
  }
}
