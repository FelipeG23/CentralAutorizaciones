import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerDerivacionesComponent } from './ver-derivaciones.component';

describe('VerDerivacionesComponent', () => {
  let component: VerDerivacionesComponent;
  let fixture: ComponentFixture<VerDerivacionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerDerivacionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerDerivacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
