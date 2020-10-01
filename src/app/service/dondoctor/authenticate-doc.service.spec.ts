import { TestBed } from '@angular/core/testing';

import { AuthenticateDocService } from './authenticate-doc.service';

describe('AuthenticateDocService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuthenticateDocService = TestBed.get(AuthenticateDocService);
    expect(service).toBeTruthy();
  });
});
