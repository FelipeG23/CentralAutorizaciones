import { TestBed } from '@angular/core/testing';

import { CambiocitaimgService } from './cambiocitaimg.service';

describe('CambiocitaimgService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CambiocitaimgService = TestBed.get(CambiocitaimgService);
    expect(service).toBeTruthy();
  });
});
