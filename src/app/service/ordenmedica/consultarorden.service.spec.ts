import { TestBed } from '@angular/core/testing';

import { ConsultarordenService } from './consultarorden.service';

describe('ConsultarordenService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConsultarordenService = TestBed.get(ConsultarordenService);
    expect(service).toBeTruthy();
  });
});
