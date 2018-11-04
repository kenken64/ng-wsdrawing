import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SigncanvasComponent } from './signcanvas.component';

describe('SigncanvasComponent', () => {
  let component: SigncanvasComponent;
  let fixture: ComponentFixture<SigncanvasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SigncanvasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SigncanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
