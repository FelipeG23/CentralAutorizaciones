import { TestBed } from '@angular/core/testing';

import { AgreementsDocService } from './agreements-doc.service';

describe('AgreementsDocService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AgreementsDocService = TestBed.get(AgreementsDocService);
    expect(service).toBeTruthy();
  });
});
