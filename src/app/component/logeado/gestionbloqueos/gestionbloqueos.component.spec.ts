import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionBloqueos } from './gestionbloqueos.component';

describe('AutorizarComponent', () => {
  let component: GestionBloqueos;
  let fixture: ComponentFixture<GestionBloqueos>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionBloqueos ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionBloqueos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
