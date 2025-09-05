import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationWithAddressSearchComponent } from './location-with-address-search.component';

describe('LocationWithAddressSearchComponent', () => {
  let component: LocationWithAddressSearchComponent;
  let fixture: ComponentFixture<LocationWithAddressSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationWithAddressSearchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationWithAddressSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
