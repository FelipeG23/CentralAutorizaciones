import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrazaComponent } from './traza.component';

describe('TrazaComponent', () => {
  let component: TrazaComponent;
  let fixture: ComponentFixture<TrazaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrazaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrazaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
