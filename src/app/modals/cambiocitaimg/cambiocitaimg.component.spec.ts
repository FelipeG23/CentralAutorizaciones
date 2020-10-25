import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CambiocitaImgComponent } from './cambiocitaimg.component';

describe('CambiocitaComponent', () => {
  let component: CambiocitaImgComponent;
  let fixture: ComponentFixture<CambiocitaImgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CambiocitaImgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CambiocitaImgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
