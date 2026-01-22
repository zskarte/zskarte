import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarChangesetComponent } from './sidebar-changeset.component';

describe('SidebarChangesetComponent', () => {
  let component: SidebarChangesetComponent;
  let fixture: ComponentFixture<SidebarChangesetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarChangesetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarChangesetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
