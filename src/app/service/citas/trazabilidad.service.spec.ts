import { TestBed } from '@angular/core/testing';

import { TrazabilidadService } from './trazabilidad.service';

describe('TrazabilidadService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TrazabilidadService = TestBed.get(TrazabilidadService);
    expect(service).toBeTruthy();
  });
});
