import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoConvenioComponent } from './info-convenio.component';

describe('InfoConvenioComponent', () => {
  let component: InfoConvenioComponent;
  let fixture: ComponentFixture<InfoConvenioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoConvenioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoConvenioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
