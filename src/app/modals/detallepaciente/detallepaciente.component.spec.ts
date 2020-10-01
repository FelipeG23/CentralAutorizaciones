import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallepacienteComponent } from './detallepaciente.component';

describe('DetallepacienteComponent', () => {
  let component: DetallepacienteComponent;
  let fixture: ComponentFixture<DetallepacienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetallepacienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallepacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
