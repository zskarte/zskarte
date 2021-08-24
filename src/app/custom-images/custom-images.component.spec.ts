import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxIndexedDBService } from 'ngx-indexed-db';

import { CustomImagesComponent } from './custom-images.component';

describe('CustomImagesComponent', () => {
  let component: CustomImagesComponent;
  let fixture: ComponentFixture<CustomImagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomImagesComponent ],
      providers: [
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', [ 'close' ]) },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: NgxIndexedDBService, useValue: jasmine.createSpyObj('NgxIndexedDBService', [ 'add' ]) },
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
