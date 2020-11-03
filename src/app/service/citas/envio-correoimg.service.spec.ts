import { TestBed } from '@angular/core/testing';

import { EnvioCorreoimgService } from './envio-EnvioCorreoimg.service';

describe('EnvioCorreoimgService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EnvioCorreoimgService = TestBed.get(EnvioCorreoimgService);
    expect(service).toBeTruthy();
  });
});
