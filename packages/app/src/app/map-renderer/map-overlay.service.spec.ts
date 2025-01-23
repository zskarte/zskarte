import { TestBed } from '@angular/core/testing';

import { MapOverlayService } from './map-overlay.service';

describe('MapRendererOverlayService', () => {
  let service: MapOverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapOverlayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
