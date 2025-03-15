import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalFormComponent } from './journal-form.component';

describe('JournalFormComponent', () => {
  let component: JournalFormComponent;
  let fixture: ComponentFixture<JournalFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JournalFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
