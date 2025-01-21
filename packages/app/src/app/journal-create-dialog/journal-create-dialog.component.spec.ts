import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalCreateDialogComponent } from './journal-create-dialog.component';

describe('JournalCreateDialogComponent', () => {
  let component: JournalCreateDialogComponent;
  let fixture: ComponentFixture<JournalCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalCreateDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JournalCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
