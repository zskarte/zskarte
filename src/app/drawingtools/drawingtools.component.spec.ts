import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { DrawingDialogComponent } from '../drawing-dialog/drawing-dialog.component';
import { TextDialogComponent } from '../text-dialog/text-dialog.component';

import { DrawingtoolsComponent } from './drawingtools.component';

describe('DrawingtoolsComponent', () => {
  let component: DrawingtoolsComponent;
  let fixture: ComponentFixture<DrawingtoolsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatMenuModule
      ],
      declarations: [ DrawingtoolsComponent, TextDialogComponent, DrawingDialogComponent ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawingtoolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
