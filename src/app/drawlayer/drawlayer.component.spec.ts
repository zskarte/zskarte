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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { EditCoordinatesComponent } from '../edit-coordinates/edit-coordinates.component';
import OlMap from 'ol/Map';

import {DrawlayerComponent} from './drawlayer.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DrawlayerComponent', () => {
  let component: DrawlayerComponent;
  let fixture: ComponentFixture<DrawlayerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule
      ],
      providers: [
        { provide: NgxIndexedDBService, useValue: jasmine.createSpyObj('NgxIndexedDBService', [ 'add' ]) }
      ],
      declarations: [ DrawlayerComponent, ConfirmationDialogComponent, EditCoordinatesComponent ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawlayerComponent);
    component = fixture.componentInstance;
    fixture.componentInstance.inputMap = new OlMap();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
