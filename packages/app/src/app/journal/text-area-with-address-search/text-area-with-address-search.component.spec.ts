import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextAreaWithAddressSearchComponent } from './text-area-with-address-search.component';

describe('TextAreaWithAddressSearchComponent', () => {
  let component: TextAreaWithAddressSearchComponent;
  let fixture: ComponentFixture<TextAreaWithAddressSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextAreaWithAddressSearchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextAreaWithAddressSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
