import { TestBed } from '@angular/core/testing';

import { BusinessDocService } from './business-doc.service';

describe('BusinessDocService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BusinessDocService = TestBed.get(BusinessDocService);
    expect(service).toBeTruthy();
  });
});
