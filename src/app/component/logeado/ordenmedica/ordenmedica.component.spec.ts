import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenmedicaComponent } from './ordenmedica.component';

describe('OrdenmedicaComponent', () => {
  let component: OrdenmedicaComponent;
  let fixture: ComponentFixture<OrdenmedicaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrdenmedicaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdenmedicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
