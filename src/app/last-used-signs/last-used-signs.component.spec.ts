import { LastUsedSignComponent } from './last-used-signs.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('EditCoordinatesComponent', () => {
  let component: LastUsedSignComponent;
  let fixture: ComponentFixture<LastUsedSignComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ LastUsedSignComponent ],
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
    fixture = TestBed.createComponent(LastUsedSignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
