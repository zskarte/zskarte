import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { EditCoordinatesComponent } from '../edit-coordinates/edit-coordinates.component';
import OlMap from 'ol/Map';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';

import {DrawlayerComponent} from './drawlayer.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SharedStateService } from '../shared-state.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('DrawlayerComponent', () => {
  let component: DrawlayerComponent;
  let fixture: ComponentFixture<DrawlayerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        HttpClientTestingModule
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

  it('should caluculate coordinates for selected Point', inject([SharedStateService], (sharedStateService: SharedStateService) => {
    component.ngOnInit();

    // Point to Test (near Belp Flughafen)
    const coordinates =  [834167.2, 5927775.4]
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
    expect(component.selectedFeatureCoordinates[0]).toBeCloseTo(7.4, 0.01);
    expect(component.selectedFeatureCoordinates[1]).toBeCloseTo(47, 0.01);
  }));

  it('should calculate coordinates for selected Polygon', inject([SharedStateService], (sharedStateService: SharedStateService) => {
    component.ngOnInit();

    // Polygon to Test (near Belp Flughafen)
    const coordinates = [
      [
        [ 833840.87, 5928429.10 ],
        [ 835857.35, 5928204 ],
        [ 833840.87, 5928429.10 ]
      ]
    ];

    component.selectedProjectionIndex = 0;
    component.selectedFeature = new Feature({
      geometry: new Polygon(coordinates),
    });
    sharedStateService.featureSource.next(component.selectedFeature);

    // check LV95
    expect(component.selectedFeatureCoordinates[0]).toBeCloseTo(2604642.5, 0.1);
    expect(component.selectedFeatureCoordinates[1]).toBeCloseTo(1196062.5, 0.1);

    component.rotateProjection();

    // check WGS84
    expect(component.selectedFeatureCoordinates[0]).toBeCloseTo(7.4, 0.01);
    expect(component.selectedFeatureCoordinates[1]).toBeCloseTo(46.9, 0.01);
  }));
});
