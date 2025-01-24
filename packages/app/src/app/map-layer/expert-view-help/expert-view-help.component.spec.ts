import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpertViewHelpComponent } from './expert-view-help.component';

describe('ExpertViewHelpComponent', () => {
  let component: ExpertViewHelpComponent;
  let fixture: ComponentFixture<ExpertViewHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpertViewHelpComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpertViewHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
