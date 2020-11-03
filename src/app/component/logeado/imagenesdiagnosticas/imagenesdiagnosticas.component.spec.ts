import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagenesdiagnosticasComponent } from './imagenesdiagnosticas.component';

describe('ImagenesdiagnosticasComponent', () => {
  let component: ImagenesdiagnosticasComponent;
  let fixture: ComponentFixture<ImagenesdiagnosticasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImagenesdiagnosticasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImagenesdiagnosticasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
