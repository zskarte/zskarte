import { TestBed } from '@angular/core/testing';

import { MapRendererService } from './map-renderer.service';

describe('MapRendererService', () => {
  let service: MapRendererService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapRendererService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
