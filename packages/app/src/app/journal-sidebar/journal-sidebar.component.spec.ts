import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalSidebarComponent } from './journal-sidebar.component';

describe('JournalSidebarComponent', () => {
  let component: JournalSidebarComponent;
  let fixture: ComponentFixture<JournalSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JournalSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
