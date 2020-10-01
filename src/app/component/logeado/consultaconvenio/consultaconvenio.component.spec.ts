import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaconvenioComponent } from './consultaconvenio.component';

describe('ConsultaconvenioComponent', () => {
  let component: ConsultaconvenioComponent;
  let fixture: ComponentFixture<ConsultaconvenioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaconvenioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaconvenioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
