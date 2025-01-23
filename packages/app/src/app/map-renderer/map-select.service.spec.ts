import { TestBed } from '@angular/core/testing';

import { MapSelectService } from './map-select.service';

describe('MapSelectionService', () => {
  let service: MapSelectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapSelectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
