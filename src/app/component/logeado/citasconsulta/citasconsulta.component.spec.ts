import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CitasconsultaComponent } from './citasconsulta.component';

describe('CitasconsultaComponent', () => {
  let component: CitasconsultaComponent;
  let fixture: ComponentFixture<CitasconsultaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CitasconsultaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CitasconsultaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
