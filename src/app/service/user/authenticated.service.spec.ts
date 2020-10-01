import { TestBed } from '@angular/core/testing';

import { AuthenticatedService } from './authenticated.service';

describe('AuthenticatedService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuthenticatedService = TestBed.get(AuthenticatedService);
    expect(service).toBeTruthy();
  });
});
