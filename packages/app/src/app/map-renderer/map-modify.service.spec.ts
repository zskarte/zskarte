import { TestBed } from '@angular/core/testing';

import { MapModifyService } from './map-modify.service';

describe('MapModifyService', () => {
  let service: MapModifyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapModifyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
