import { TestBed } from '@angular/core/testing';

import { BloqueoService } from './bloqueo.service';

describe('BloqueoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BloqueoService = TestBed.get(BloqueoService);
    expect(service).toBeTruthy();
  });
});
