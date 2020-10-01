import { TestBed } from '@angular/core/testing';

import { ClasificacionService } from './clasificacion.service';

describe('ClasificacionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ClasificacionService = TestBed.get(ClasificacionService);
    expect(service).toBeTruthy();
  });
});
