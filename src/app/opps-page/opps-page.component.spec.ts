import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OppsPageComponent } from './opps-page.component';

describe('OppsPageComponent', () => {
  let component: OppsPageComponent;
  let fixture: ComponentFixture<OppsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OppsPageComponent]
    });
    fixture = TestBed.createComponent(OppsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
