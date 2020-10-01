import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CambiocitaComponent } from './eliminarOm.component';

describe('CambiocitaComponent', () => {
  let component: CambiocitaComponent;
  let fixture: ComponentFixture<CambiocitaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CambiocitaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CambiocitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
