import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarRootComponent } from './sidebar-root.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SidebarRootComponent', () => {
  let component: SidebarRootComponent;
  let fixture: ComponentFixture<SidebarRootComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [SidebarRootComponent],
    }).compileComponents();
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
