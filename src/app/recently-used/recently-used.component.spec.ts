import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentlyUsedComponent } from './recently-used.component';

describe('RecentlyUsedComponent', () => {
  let component: RecentlyUsedComponent;
  let fixture: ComponentFixture<RecentlyUsedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecentlyUsedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentlyUsedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
