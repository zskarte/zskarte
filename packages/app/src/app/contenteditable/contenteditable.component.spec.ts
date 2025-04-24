import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContenteditableComponent } from './contenteditable.component';

describe('ContenteditableComponent', () => {
  let component: ContenteditableComponent;
  let fixture: ComponentFixture<ContenteditableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContenteditableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContenteditableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
