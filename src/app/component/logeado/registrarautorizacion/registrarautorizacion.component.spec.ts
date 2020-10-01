import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarautorizacionComponent } from './registrarautorizacion.component';

describe('RegistrarautorizacionComponent', () => {
  let component: RegistrarautorizacionComponent;
  let fixture: ComponentFixture<RegistrarautorizacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrarautorizacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrarautorizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
