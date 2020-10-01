import { TestBed } from '@angular/core/testing';

import { CambiocitaService } from './cambiocita.service';

describe('CambiocitaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CambiocitaService = TestBed.get(CambiocitaService);
    expect(service).toBeTruthy();
  });
});
