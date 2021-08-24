/*
 * Copyright © 2018-2020 ZSO Bern Plus / PCi Fribourg
 *
 * This file is part of Zivilschutzkarte 2.
 *
 * Zivilschutzkarte 2 is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * Zivilschutzkarte 2 is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along with
 * Zivilschutzkarte 2.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 */

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { DetailImageViewComponent } from '../detail-image-view/detail-image-view.component';
import { DrawingDialogComponent } from '../drawing-dialog/drawing-dialog.component';

import { SelectedFeatureComponent } from './selected-feature.component';

describe('SelectedFeatureComponent', () => {
  let component: SelectedFeatureComponent;
  let fixture: ComponentFixture<SelectedFeatureComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      declarations: [ SelectedFeatureComponent, DrawingDialogComponent, ConfirmationDialogComponent, DetailImageViewComponent ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
