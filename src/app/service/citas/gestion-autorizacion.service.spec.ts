import { TestBed } from '@angular/core/testing';

import { GestionAutorizacionService } from './gestion-autorizacion.service';

describe('GestionAutorizacionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GestionAutorizacionService = TestBed.get(GestionAutorizacionService);
    expect(service).toBeTruthy();
  });
});
