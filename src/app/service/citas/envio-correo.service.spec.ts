import { TestBed } from '@angular/core/testing';

import { EnvioCorreoService } from './envio-correo.service';

describe('EnvioCorreoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EnvioCorreoService = TestBed.get(EnvioCorreoService);
    expect(service).toBeTruthy();
  });
});
