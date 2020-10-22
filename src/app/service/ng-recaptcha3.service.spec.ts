import { TestBed } from '@angular/core/testing';

import { NgRecaptcha3Service } from './ng-recaptcha3.service';

describe('NgRecaptcha3Service', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgRecaptcha3Service = TestBed.get(NgRecaptcha3Service);
    expect(service).toBeTruthy();
  });
});
