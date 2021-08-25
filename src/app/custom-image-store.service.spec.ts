import {TestBed} from '@angular/core/testing';
import { NgxIndexedDBService } from 'ngx-indexed-db';

import { CustomImageStoreService } from './custom-image-store.service';

describe('CustomImageStoreService', () => {
  let service: CustomImageStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: NgxIndexedDBService, useValue: jasmine.createSpyObj('NgxIndexedDBService', [ 'add' ]) },
      ]
    });
    service = TestBed.inject(CustomImageStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
