import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LanguageChooserComponent } from './language-chooser.component';

describe('LanguageChooserComponent', () => {
  let component: LanguageChooserComponent;
  let fixture: ComponentFixture<LanguageChooserComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [LanguageChooserComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(LanguageChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
