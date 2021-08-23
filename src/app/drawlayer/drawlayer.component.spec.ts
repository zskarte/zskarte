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

import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { EditCoordinatesComponent } from '../edit-coordinates/edit-coordinates.component';
import OlMap from 'ol/Map';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';

import {DrawlayerComponent} from './drawlayer.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SharedStateService } from '../shared-state.service';

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

  it('should caluculate coordinates for the selected Feature', inject([SharedStateService], (sharedStateService: SharedStateService) => {
    component.ngOnInit();
    const coordinates =  [834167.1889149096, 5927775.4004392065]
    component.selectedProjectionIndex = 0;

    component.selectedFeature = new Feature({
      geometry: new Point(coordinates),
    });
    sharedStateService.featureSource.next(component.selectedFeature);

    // check LV95
    expect(component.selectedFeatureCoordinates[0]).toBeCloseTo(2604176, 0.1);
    expect(component.selectedFeatureCoordinates[1]).toBeCloseTo(1195693, 0.1);

    component.rotateProjection();

    // check WGS84
    expect(component.selectedFeatureCoordinates[0]).toBeCloseTo(7.5, 0.1);
    expect(component.selectedFeatureCoordinates[1]).toBeCloseTo(47, 0.1);
  }));
});
