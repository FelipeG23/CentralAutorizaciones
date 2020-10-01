import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerRadicarComponent } from './ver-radicar.component';

describe('VerRadicarComponent', () => {
  let component: VerRadicarComponent;
  let fixture: ComponentFixture<VerRadicarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerRadicarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerRadicarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
