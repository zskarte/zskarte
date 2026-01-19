import { TestBed } from '@angular/core/testing';

import { MapSearchAreaService } from './map-search-area.service';

describe('MapSearchAreaService', () => {
  let service: MapSearchAreaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapSearchAreaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
