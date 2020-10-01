import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionContinuidadComponent } from './gestion-continuidad.component';

describe('GestionContinuidadComponent', () => {
  let component: GestionContinuidadComponent;
  let fixture: ComponentFixture<GestionContinuidadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionContinuidadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionContinuidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
