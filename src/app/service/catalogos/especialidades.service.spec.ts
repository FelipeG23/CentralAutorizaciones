import { TestBed } from '@angular/core/testing';

import { EspecialidadService } from './especialidades.service';

describe('EspecialidadService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EspecialidadService = TestBed.get(EspecialidadService);
    expect(service).toBeTruthy();
  });
});
