import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentlyUsedSignsComponent } from './recently-used-signs.component';

describe('RecentlyUsedSignsComponent', () => {
  let component: RecentlyUsedSignsComponent;
  let fixture: ComponentFixture<RecentlyUsedSignsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecentlyUsedSignsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentlyUsedSignsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
