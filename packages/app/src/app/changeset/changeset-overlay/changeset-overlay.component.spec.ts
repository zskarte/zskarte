import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangesetOverlayComponent } from './changeset-overlay.component';

describe('ChangesetOverlayComponent', () => {
  let component: ChangesetOverlayComponent;
  let fixture: ComponentFixture<ChangesetOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangesetOverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangesetOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
