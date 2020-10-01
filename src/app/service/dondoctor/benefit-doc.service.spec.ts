import { TestBed } from '@angular/core/testing';

import { BenefitDocService } from './benefit-doc.service';

describe('BenefitDocService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BenefitDocService = TestBed.get(BenefitDocService);
    expect(service).toBeTruthy();
  });
});
