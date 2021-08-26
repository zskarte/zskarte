import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { FavoriteSignsComponent } from './favorite-signs.component';

describe('EditCoordinatesComponent', () => {
  let component: FavoriteSignsComponent;
  let fixture: ComponentFixture<FavoriteSignsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ FavoriteSignsComponent ],
      providers: [
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', [ 'close' ]) },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoriteSignsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
