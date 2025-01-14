import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarConnectionsComponent } from './sidebar-connections.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SidebarConnectionsComponent', () => {
  let component: SidebarConnectionsComponent;
  let fixture: ComponentFixture<SidebarConnectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarConnectionsComponent],
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarConnectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
