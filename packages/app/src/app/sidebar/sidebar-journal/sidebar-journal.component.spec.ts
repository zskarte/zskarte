import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarJournalComponent } from './sidebar-journal.component';

describe('SidebarJournalComponent', () => {
  let component: SidebarJournalComponent;
  let fixture: ComponentFixture<SidebarJournalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarJournalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarJournalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
