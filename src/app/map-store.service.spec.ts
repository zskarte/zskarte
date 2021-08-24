import {TestBed} from '@angular/core/testing';
import { NgxIndexedDBService } from 'ngx-indexed-db';

import { MapStoreService } from './map-store.service';

describe('MapStoreService', () => {
  let service: MapStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: NgxIndexedDBService, useValue: jasmine.createSpyObj('NgxIndexedDBService', [ 'add' ]) },
      ]
    });
    service = TestBed.inject(MapStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
