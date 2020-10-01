import { TestBed } from '@angular/core/testing';

import { SedesService } from './sedes.service';

describe('SedesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SedesService = TestBed.get(SedesService);
    expect(service).toBeTruthy();
  });
});
