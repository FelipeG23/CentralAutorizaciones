import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RadicaOrdenMedicaComponent } from './radica-orden-medica.component';

describe('RadicaOrdenMedicaComponent', () => {
  let component: RadicaOrdenMedicaComponent;
  let fixture: ComponentFixture<RadicaOrdenMedicaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RadicaOrdenMedicaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadicaOrdenMedicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
