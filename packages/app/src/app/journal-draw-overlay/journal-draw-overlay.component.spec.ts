import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalDrawOverlayComponent } from './journal-draw-overlay.component';

describe('JournalDrawOverlayComponent', () => {
  let component: JournalDrawOverlayComponent;
  let fixture: ComponentFixture<JournalDrawOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalDrawOverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JournalDrawOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
