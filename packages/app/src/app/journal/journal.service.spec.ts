import { TestBed } from '@angular/core/testing';

import { JournalService } from './journal.service';

describe('JournalService', () => {
  let service: JournalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JournalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
