import { TestBed } from '@angular/core/testing';

import { PlansDocService } from './plans-doc.service';

describe('PlansDocService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PlansDocService = TestBed.get(PlansDocService);
    expect(service).toBeTruthy();
  });
});
