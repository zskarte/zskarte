import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarRootComponent } from './sidebar-root.component';

describe('SidebarRootComponent', () => {
  let component: SidebarRootComponent;
  let fixture: ComponentFixture<SidebarRootComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SidebarRootComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
