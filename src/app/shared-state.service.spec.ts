import { TestBed } from '@angular/core/testing';

import { SharedStateService } from './shared-state.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SharedStateService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    })
  );

  it('should be created', () => {
    const service: SharedStateService = TestBed.get(SharedStateService);
    expect(service).toBeTruthy();
  });
});
