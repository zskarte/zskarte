import { TestBed } from '@angular/core/testing';

import { MapPrintService } from './map-print.service';

describe('MapPrintService', () => {
  let service: MapPrintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapPrintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
