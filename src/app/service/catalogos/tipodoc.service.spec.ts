import { TestBed } from '@angular/core/testing';

import { TipodocService } from './tipodoc.service';

describe('TipodocService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TipodocService = TestBed.get(TipodocService);
    expect(service).toBeTruthy();
  });
});
