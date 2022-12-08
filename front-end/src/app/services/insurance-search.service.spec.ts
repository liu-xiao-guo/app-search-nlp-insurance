import { TestBed } from '@angular/core/testing';

import { InsuranceSearchService } from './insurance-search.service';

describe('InsuranceSearchService', () => {
  let service: InsuranceSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InsuranceSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
