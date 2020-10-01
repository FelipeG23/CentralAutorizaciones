import { TestBed } from '@angular/core/testing';

import { DetalleCitaService } from './detalle-cita.service';

describe('DetalleCitaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DetalleCitaService = TestBed.get(DetalleCitaService);
    expect(service).toBeTruthy();
  });
});
