import { TestBed } from '@angular/core/testing';

import { BenefitsDocService } from './benefits-doc.service';

describe('BenefitsDocService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BenefitsDocService = TestBed.get(BenefitsDocService);
    expect(service).toBeTruthy();
  });
});
