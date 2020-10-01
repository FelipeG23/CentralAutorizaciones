import { TestBed } from '@angular/core/testing';

import { ConvenioService } from './convenio.service';

describe('ConvenioService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConvenioService = TestBed.get(ConvenioService);
    expect(service).toBeTruthy();
  });
});
