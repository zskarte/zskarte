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
import { Component, Input, OnInit } from '@angular/core';
import Select from 'ol/interaction/Select';
import Modify from 'ol/interaction/Modify';
import Vector from 'ol/source/Vector';
import LayerVector from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Polygon from 'ol/geom/Polygon';
import Feature from 'ol/Feature';
import Draw from 'ol/interaction/Draw';
import OlMap from 'ol/Map';
import { transform } from 'ol/proj';
import DrawHole from 'ol-ext/interaction/DrawHole';
import Overlay from 'ol/Overlay';
import { getCenter } from 'ol/extent';
import { SharedStateService } from '../shared-state.service';
import { DrawStyle } from './draw-style';
import { I18NService } from '../i18n.service';
import { MapStoreService } from '../map-store.service';
import { SessionsService } from '../sessions.service';
import CENTER_LEFT from 'ol/OverlayPositioning';
import { CustomImageStoreService } from '../custom-image-store.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { v4 as uuidv4 } from 'uuid';
import { EditCoordinatesComponent } from '../edit-coordinates/edit-coordinates.component';
import { DisplayMode } from '../entity/displayMode';
import Cluster from 'ol/source/Cluster';
import Collection from 'ol/Collection';
import { Sign } from '../entity/sign';
import { availableProjections, mercatorProjection, swissProjection } from '../projections';
import { filter } from 'rxjs/operators';

export const DRAW_LAYER_ZINDEX = 100000;
export const CLUSTER_LAYER_ZINDEX = DRAW_LAYER_ZINDEX + 1;

@Component({
  selector: 'app-drawlayer',
  templateUrl: './drawlayer.component.html',
  styleUrls: ['./drawlayer.component.css'],
})
export class DrawlayerComponent implements OnInit {
  constructor(
    private sharedState: SharedStateService,
    private mapStore: MapStoreService,
    public i18n: I18NService,
    private sessions: SessionsService,
    private customImages: CustomImageStoreService,
    private dialog: MatDialog
  ) {
    this.startAutosave();
  }

  private static mapSaveInterval = 1000;
  private static saveRunnerLock = false;

  @Input() inputMap: OlMap;

  filters = {};
  map: OlMap;
  currentDrawingSign = null;
  status = 'Loading data...';
  currentSessionId: string;
  recordChanges = false;
  maxZIndex = 0;
  minZIndex = 0;
  selectedFeatureCoordinates = null;
  selectedProjectionIndex = 0;

  source = new Vector({
    format: new GeoJSON(),
  });

  clusterSource = new Vector({
    format: new GeoJSON(),
  });

  cluster = new Cluster({
    distance: 140,
    source: this.clusterSource,
    geometryFunction: (feature) => {
      if (!this.isSigFiltered(feature.get('sig'))) {
        return feature.getGeometry();
      }
      return null;
    },
  });

  clusterLayer = new LayerVector({
    source: this.cluster,
    style: (feature, resolution) => {
      return DrawStyle.clusterStyleFunctionDefault(feature, resolution);
    },
  });

  layer = new LayerVector({
    source: this.source,
    style: (feature, resolution) => {
      const sig = feature.get('sig');

      if (!this.isSigFiltered(sig)) {
        return DrawStyle.styleFunction(feature, resolution);
      } else {
        return [];
      }

      //return DrawStyle.styleFunction(feature, resolution);
    },
    className: 'drawLayer',
  });

  select = new Select({
    // toggleCondition: never,
    style: (feature, resolution) => {
      return DrawStyle.styleFunctionSelect(
        feature,
        resolution,
        !this.historyMode
      );
    },
    // condition: never
    layers: [this.layer, this.clusterLayer],
    hitTolerance: 10,
  });

  lastModificationPointCoordinates = null;
  modifiableFeatures: Collection<Feature> = new Collection([]);

  modify = new Modify({
    features: this.modifiableFeatures,
    condition: (event) => {
      if (
        this.isModifyPointInteraction() &&
        this.selectedFeature &&
        this.selectedFeature.get('sig') &&
        !this.selectedFeature.get('sig').protected
      ) {
        this.lastModificationPointCoordinates = this.modify['vertexFeature_']
          .getGeometry()
          .getCoordinates();
        this.toggleRemoveButton(true);
        this.removeButton.setPosition(event.coordinate);
      }
      return true;
    },
    hitTolerance: 10,
  });
  removeButton: Overlay = null;

  firstLoad = true;
  drawHole = new DrawHole({
    layers: [this.layer],
  });
  private dirtyMap = false;

  mergeSource: any = null;

  historyMode: boolean;

  selectedFeature: Feature;

  private drawers: { [key: string]: Draw } = {};

  private getSigFilterString(sig: Sign): string {
    let filterString = '';
    if (sig.type === 'Polygon' && !sig.src) {
      // empty polygon without source
      filterString = sig.filterValue;
    } else if (sig.type === 'LineString' && !sig.src) {
      // line without source or text
      filterString = sig.filterValue;
    } else {
      filterString = sig.origSrc || sig.src;
    }
    return filterString;
  }

  private isSigFiltered(sig: Sign): boolean {
    if (!sig) {
      return false;
    }
    return !!this.filters[this.getSigFilterString(sig)];
  }

  private startAutosave() {
    if (!DrawlayerComponent.saveRunnerLock) {
      console.log('starting autosave now...');
      // Ensure there is only a single autosave interval running at a time.
      DrawlayerComponent.saveRunnerLock = true;
      setInterval(() => this.save(), DrawlayerComponent.mapSaveInterval);
    }
  }

  public toggleFilters(instances: string[], active: boolean) {
    let hasChanges = false;
    instances.forEach((i) => {
      if (this.filters[i] != active) {
        this.filters[i] = active;
        hasChanges = true;
      }
    });
    if (hasChanges) {
      this.source.changed();
      if (this.historyMode) {
        this.clusterSource.changed();
      }
      this.clearSelection();
    }
  }

  public toggleFilter(sig: Sign) {
    const filterString = this.getSigFilterString(sig);
    this.filters[filterString] = !this.filters[filterString];
    this.source.changed();
    if (this.historyMode) {
      this.clusterSource.changed();
    }
    this.clearSelection();
  }

  private isModifyPointInteraction() {
    return (
      this.modify['lastPointerEvent_'] &&
      this.modify['vertexFeature_'] &&
      this.select.getFeatures()
    );
  }

  private indexOfPointInCoordinateGroup(
    coordinateGroup: number[][],
    compareCoordinate: number[]
  ) {
    for (let i = 0; i < coordinateGroup.length; i++) {
      const coordinate = coordinateGroup[i];
      if (
        coordinate[0] === compareCoordinate[0] &&
        coordinate[1] === compareCoordinate[1]
      ) {
        return i;
      }
    }
    return -1;
  }

  private getCoordinationGroupOfLastPoint() {
    // Since we're working with single select, this should be only one - we iterate it nevertheless for being defensive
    for (const feature of this.select.getFeatures().getArray()) {
      const geometry = feature.getGeometry();
      switch (geometry.getType()) {
        case 'Polygon':
          for (let i = 0; i < geometry.getCoordinates().length; i++) {
            const coordinateGroup = geometry.getCoordinates()[i];
            if (
              this.indexOfPointInCoordinateGroup(
                coordinateGroup,
                this.lastModificationPointCoordinates
              ) != -1
            ) {
              return {
                feature: feature,
                coordinateGroupIndex: i,
                otherCoordinationGroupCount:
                  geometry.getCoordinates().length - 1,
                minimalAmountOfPoints: coordinateGroup.length <= 4,
              };
            }
          }
          return null;
        case 'LineString':
          return {
            feature: feature,
            coordinateGroupIndex: null,
            otherCoordinationGroupCount: 0,
            minimalAmountOfPoints: geometry.getCoordinates().length <= 2,
          };
        case 'Point':
          return {
            feature: feature,
            coordinateGroupIndex: null,
            otherCoordinationGroupCount: 0,
            minimalAmountOfPoints: true,
          };
      }
    }
    return null;
  }

  private drawingManipulated(feature: Feature, changeEvent = false) {
    this.sharedState.drawingManipulated.next(true);
    if (this.recordChanges && !this.historyMode) {
      this.toggleFilters([feature.get('sig').src], false);
      if (changeEvent) {
        // There are too many change events (also when a feature is selected / unselected). We don't want to save those events since they are not manipulating anything...
        if (
          this.selectedFeature &&
          this.selectedFeature.getId() === feature.getId()
        ) {
          if (this.select.getFeatures().getLength() > 0) {
            this.dirtyMap = true;
          }
        }
      } else {
        this.dirtyMap = true;
      }
    }
  }

  toggleRemoveButton(show: boolean) {
    this.removeButton.getElement().style.display =
      show && !this.historyMode ? 'block' : 'none';
  }

  private setModifiableFeature(f: Feature) {
    this.modifiableFeatures.clear();
    if (f && (!f.get('sig') || !f.get('sig').protected)) {
      this.modifiableFeatures.push(f);
    }
  }

  ngOnInit() {
    this.removeButton = new Overlay({
      element: document.getElementById('removePoint'),
      positioning: CENTER_LEFT,
      offset: [10, 0],
    });
    this.modify.addEventListener('modifystart', () => {
      this.toggleRemoveButton(false);
    });
    this.modify.addEventListener('modifyend', (e) => {
      if (this.isModifyPointInteraction()) {
        this.lastModificationPointCoordinates = this.modify['vertexFeature_']
          .getGeometry()
          .getCoordinates();
        this.removeButton.setPosition(e.mapBrowserEvent.coordinate);
        this.toggleRemoveButton(true);
      }
    });
    this.removeButton.element.addEventListener('click', (e) => {
      const coordinationGroup = this.getCoordinationGroupOfLastPoint();
      if (coordinationGroup) {
        if (!coordinationGroup.minimalAmountOfPoints) {
          this.modify.removePoint();
        } else if (coordinationGroup.otherCoordinationGroupCount == 0) {
          // It's the last coordination group - we can remove the feature.
          const confirm = this.dialog.open(ConfirmationDialogComponent, {
            data: this.i18n.get('removeFeatureFromMapConfirm'), // this.i18n.get('deleteLastPointOnFeature') + " " + this.i18n.get('removeFeatureFromMapConfirm')
          });
          confirm.afterClosed().subscribe((r) => {
            if (r) {
              this.removeFeature(coordinationGroup.feature);
              this.sharedState.selectFeature(null);
            }
          });
        } else if (coordinationGroup.coordinateGroupIndex) {
          // It's not the last coordination group - so we need to get rid of the coordination group inside the feature
          const oldCoordinates = coordinationGroup.feature
            .getGeometry()
            .getCoordinates();
          const newCoordinates = [];
          for (let i = 0; i < oldCoordinates.length; i++) {
            if (i != coordinationGroup.coordinateGroupIndex) {
              newCoordinates.push(oldCoordinates[i]);
            }
          }
          coordinationGroup.feature
            .getGeometry()
            .setCoordinates(newCoordinates);
        }
      }
      this.toggleRemoveButton(false);
    });
    this.layer.setZIndex(DRAW_LAYER_ZINDEX);
    this.clusterLayer.setZIndex(CLUSTER_LAYER_ZINDEX);
    this.map = this.inputMap;
    this.map.addOverlay(this.removeButton);
    this.map.addInteraction(this.select);
    this.map.addInteraction(this.modify);
    this.map.addInteraction(this.drawHole);
    this.drawHole.setActive(true);
    this.select.addEventListener('select', (e) => {
      this.selectionChanged();
    });
    this.source.addEventListener('addfeature', (e) => {
      if (!e.feature.getId()) {
        e.feature.setId(uuidv4());
      }
      this.selectionChanged();
      this.drawingManipulated(e.feature);
    });
    this.sharedState.currentFeature.subscribe((f) => {
      this.setModifiableFeature(f);
      if (f && this.getSelectedFeature() !== f) {
        this.select.getFeatures().clear();
        this.select.getFeatures().push(f);
      }
    });

    this.source.addEventListener('removefeature', (e) => {
      this.drawingManipulated(e.feature);
    });
    this.source.addEventListener('changefeature', (e) => {
      this.drawingManipulated(e.feature, true);
    });
    this.drawHole.addEventListener('drawend', (e) => {
      this.sharedState.updateDrawHoleMode(false);
    });
    this.sharedState.defineCoordinates.subscribe((defineCoordinates) => {
      if (defineCoordinates) {
        this.defineCoordinates();
      }
    });
    this.map.getView().on('change:resolution', () => {
      if (this.historyMode) {
        const resolution = Math.ceil(
          Math.sqrt(this.map.getView().getResolution())
        );
        const newDistance = Math.max(1, resolution + 1) * 15;
        if (newDistance !== this.cluster.getDistance()) {
          this.cluster.setDistance(newDistance);
        }
        if (
          this.getSelectedFeature() &&
          this.getSelectedFeature().get('features')
        ) {
          // Since clustering means the elements change when zooming in / out, we need to get rid of the selection made if the selection is a cluster (because the instance could not be available anymore)
          this.clearSelection();
        }
      }
    });

    this.sharedState.currentFeature.subscribe((feature) => {
      if (feature !== this.getSelectedFeature()) {
        this.select.getFeatures().clear();
        if (feature) {
          this.select.getFeatures().push(feature);
        }
        this.select.changed();
      }
    });
    this.sharedState.deletedFeature.subscribe((feature) =>
      this.removeFeature(feature)
    );
    this.sharedState.currentSign.subscribe((sign) => this.startDrawing(sign));
    this.sharedState.drawHoleMode.subscribe((drawHole) =>
      this.doDrawHole(drawHole)
    );
    this.sharedState.displayMode.subscribe((displayMode) => {
      if (this.historyMode && displayMode !== DisplayMode.HISTORY) {
        this.endHistoryMode();
      } else if (!this.historyMode && displayMode === DisplayMode.HISTORY) {
        this.startHistoryMode();
      }
      this.historyMode = displayMode === DisplayMode.HISTORY;
    });
    this.sharedState.historyDate.subscribe((history) =>
      this.toggleHistoryDate(history)
    );
    this.sharedState.mergeMode.subscribe((mergeMode) =>
      this.mergeMode(mergeMode)
    );
    this.sharedState.splitMode.subscribe((splitMode) =>
      this.splitMode(splitMode)
    );
    this.sharedState.reorder.subscribe((toTop) => {
      if (toTop !== null) {
        if (toTop) {
          this.toFront(this.select.getFeatures().item(0));
        } else {
          this.toBack(this.select.getFeatures().item(0));
        }
      }
    });
    this.sharedState.zoom.subscribe((z) => {
      if (z) {
        this.map.getView().setZoom(this.map.getView().getZoom() + z);
      }
    });
    this.sharedState.session.subscribe((s) => {
      if (s) {
        if (this.currentSessionId !== s.uuid) {
          this.currentSessionId = s.uuid;
          this.clearSelection();
          // The session has changed - we need to reload
          this.status = 'Now loading the map...';
          this.load(false).then(() => {
            this.status = 'Map loaded';
            this.recordChanges = true;
          });
        }
      } else {
        this.currentSessionId = null;
        this.clearDrawingArea();
      }
    });
    // Because of the closure, we end up inside the map -> let's just add an
    // indirection and go back to the drawlayer level again.
    this.sharedState.layerChanged.subscribe((changed) => {
      if (
        changed &&
        (this.sharedState.displayMode.getValue() === DisplayMode.DRAW ||
          this.sharedState.displayMode.getValue() === DisplayMode.HISTORY)
      ) {
        if (!this.firstLoad) {
          this.map.removeLayer(this.layer);
          this.map.removeLayer(this.clusterLayer);
        }
        this.map.addLayer(this.layer);
        this.map.addLayer(this.clusterLayer);
      }
    });

    // Update current Coordinates on selectedFeature change
    this.sharedState.featureSource.pipe(filter(Boolean)).subscribe(this.setSelectedFeatureCoordinates.bind(this));
  }

  defineCoordinates() {
    const currentFeature =
      this.select.getFeatures().getLength() == 1
        ? this.select.getFeatures().item(0)
        : null;
    if (currentFeature) {
      const editDialog = this.dialog.open(EditCoordinatesComponent, {
        data: {
          geometry: currentFeature.getGeometry().getType(),
          coordinates: JSON.stringify(
            currentFeature.getGeometry().getCoordinates()
          ),
        },
      });
      editDialog.afterClosed().subscribe((result) => {
        if (result) {
          currentFeature.getGeometry().setCoordinates(result);
          this.sharedState.defineCoordinates.next(false);
        } else {
          this.sharedState.defineCoordinates.next(false);
        }
      });
    } else {
      this.sharedState.defineCoordinates.next(false);
    }
  }

  private getSelectedFeature() {
    if (this.select.getFeatures().getLength() === 1) {
      return this.select.getFeatures().item(0);
    } else if (this.select.getFeatures().getLength() === 0) {
      return null;
    } else {
      window.alert('too many items selected at once!');
    }
  }

  splitMode(split: boolean) {
    if (split) {
      const currentFeature = this.getSelectedFeature();
      if (
        currentFeature &&
        currentFeature.getGeometry().getType() === 'Polygon'
      ) {
        const coordinateGroups = currentFeature.getGeometry().getCoordinates();
        const splittedFeatures = [];
        for (const coordinateGroup of coordinateGroups) {
          const f = new Feature({
            geometry: new Polygon([coordinateGroup]),
            sig: Object.assign({}, currentFeature.get('sig')),
          });
          splittedFeatures.push(f);
        }
        this.source.addFeatures(splittedFeatures);
        this.removeFeature(currentFeature);
        this.clearSelection();
      }
    }
  }

  mergeMode(merge: boolean) {
    if (merge) {
      this.mergeSource = this.getSelectedFeature();
    } else {
      this.mergeSource = null;
    }
  }

  mergeFeatures(featureA, featureB) {
    if (
      featureA.getGeometry().getType() == 'Polygon' &&
      featureB.getGeometry().getType() == 'Polygon'
    ) {
      const newCoordinates = [];
      featureA
        .getGeometry()
        .getCoordinates()
        .forEach((c) => newCoordinates.push(c));
      featureB
        .getGeometry()
        .getCoordinates()
        .forEach((c) => newCoordinates.push(c));
      featureA.getGeometry().setCoordinates(newCoordinates);
      if (featureB.get('sig').label) {
        if (featureA.get('sig').label) {
          featureA.get('sig').label += ' ' + featureB.get('sig').label;
        } else {
          featureA.get('sig').label = featureB.get('sig').label;
        }
      }
      this.removeFeature(featureB);
      this.select.getFeatures().clear();
      this.select.getFeatures().push(featureA);
      this.sharedState.selectFeature(featureA);
    }
    this.sharedState.setMergeMode(false);
  }

  toggleHistoryDate(history: string) {
    if (this.historyMode) {
      this.loadFromHistory(history);
    }
  }

  endHistoryMode() {
    if (this.currentSessionId) {
      this.clearSelection();
      this.load().then(() => {
        // this.select.setActive(true);
        this.modify.setActive(true);
      });
    }
  }

  startHistoryMode() {
    this.clearSelection();
    this.modify.setActive(false);
    // this.select.setActive(false);
  }

  loadFromHistory(history) {
    this.sharedState.showMapLoader.next(true);
    if (history === 'now') {
      this.mapStore.getMap(this.currentSessionId).then((map) => {
        this.loadElements(map, true).then(() => {
          this.sharedState.showMapLoader.next(false);
        });
      });
    } else {
      this.mapStore
        .getHistoricalStateByKey(this.currentSessionId, history)
        .then((h) => {
          this.loadElements(h, true).then(() => {
            this.sharedState.showMapLoader.next(false);
          });
        });
    }
  }

  selectionChanged() {
    this.toggleRemoveButton(false);
    if (this.select.getFeatures().getLength() === 1) {
      const feature = this.select.getFeatures().item(0);
      this.selectedFeature = feature;
      if (this.mergeSource) {
        this.mergeFeatures(this.mergeSource, feature);
      } else {
        this.sharedState.selectFeature(feature);
      }
    } else if (this.select.getFeatures().getLength() === 0) {
      if (this.mergeSource) {
        this.sharedState.setMergeMode(false);
      }
      this.selectedFeature = null;
      this.sharedState.selectFeature(null);
    } else {
      if (this.mergeSource) {
        this.sharedState.setMergeMode(false);
      }
      window.alert('too many items selected at once!');
    }
  }

  writeFeatures(): GeoJSON {
    let features = this.source.getFeatures();
    if (this.historyMode) {
      features = features.concat(this.clusterSource.getFeatures());
    }
    return JSON.parse(
      new GeoJSON({ defaultDataProjection: 'EPSG:3857' }).writeFeatures(
        features
      )
    );
  }

  toDataUrl() {
    const result = this.writeFeatures();
    // TODO check for use cases of writing from history mode (e.g. download for revert)
    let signatureSources = this.source
      .getFeatures()
      .map((f) => f.get('sig').src);
    if (this.historyMode) {
      signatureSources = signatureSources.concat(
        this.clusterSource.getFeatures().map((f) => f.get('sig').src)
      );
    }
    // @ts-ignore
    result.images = this.customImages
      .getAllEntriesForCurrentSession()
      .filter((i: any) => signatureSources.includes(i.sign.src));
    return (
      'data:text/json;charset=UTF-8,' +
      encodeURIComponent(JSON.stringify(result))
    );
  }

  clearDrawingArea() {
    this.recordChanges = false;
    this.minZIndex = 0;
    this.maxZIndex = 0;
    this.source.clear();
    this.clusterSource.clear();
    this.clearSelection();
    DrawStyle.clearCaches();
    this.recordChanges = true;
    this.sharedState.drawingManipulated.next(true);
  }

  private clearSelection() {
    this.select.getFeatures().clear();
    this.sharedState.selectFeature(null);
  }

  removeAll() {
    if (!this.historyMode) {
      this.mapStore.removeMap(this.currentSessionId, false).then(() => {});
      this.clearDrawingArea();
      this.save();
    }
  }

  save() {
    if (!this.historyMode && this.dirtyMap) {
      this.dirtyMap = false;
      return this.mapStore.saveMap(this.currentSessionId, this.writeFeatures());
    }
  }

  loadElements(
    elements: GeoJSON,
    replace: boolean,
    reenableChangeRecording = true
  ): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.recordChanges = false;
      if (replace) {
        this.source.clear();
        this.clusterSource.clear();
        this.select.getFeatures().clear();
      }
      if (elements) {
        this.customImages.importImages(elements.images).then(() => {
          if (elements.session) {
            this.sessions.saveSession(elements.session);
            this.sharedState.loadSession(elements.session);
            resolve(false);
            return;
          }
          if (elements.features) {
            for (const feature of elements.features) {
              const zindex = feature.properties.zindex;
              if (zindex) {
                if (zindex > this.maxZIndex) {
                  this.maxZIndex = zindex;
                }
                if (zindex < this.minZIndex) {
                  this.minZIndex = zindex;
                }
              }
            }
            const geoJSON = new GeoJSON({ defaultDataProjection: 'EPSG:3857' });
            const features: Feature[] = geoJSON.readFeatures(elements);
            if (this.historyMode) {
              // In history mode, we split the point features and add them to the cluster layer
              const pointFeatures = features.filter(
                (f) => f.getGeometry().getType() === 'Point'
              );
              const otherFeatures = features.filter(
                (f) => f.getGeometry().getType() !== 'Point'
              );
              let sourceLoaded = false;
              let clusterLoaded = false;
              if (otherFeatures && otherFeatures.length > 0) {
                this.source.once('change', () => {
                  sourceLoaded = true;
                  if (clusterLoaded) {
                    this.handleLoadedElements(reenableChangeRecording, resolve);
                  }
                });
                this.source.addFeatures(otherFeatures);
              } else {
                sourceLoaded = true;
              }
              if (pointFeatures && pointFeatures.length > 0) {
                this.clusterSource.once('change', () => {
                  clusterLoaded = true;
                  if (sourceLoaded) {
                    this.handleLoadedElements(reenableChangeRecording, resolve);
                  }
                });
                this.clusterSource.addFeatures(pointFeatures);
              } else {
                clusterLoaded = true;
              }
              if (sourceLoaded && clusterLoaded) {
                this.handleLoadedElements(reenableChangeRecording, resolve);
              }
            } else {
              if (features && features.length > 0) {
                this.source.once('change', () => {
                  this.handleLoadedElements(reenableChangeRecording, resolve);
                });
                this.source.addFeatures(features);
              } else {
                this.handleLoadedElements(reenableChangeRecording, resolve);
              }
            }
          } else {
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
  }

  private handleLoadedElements(
    reenableChangeRecording: boolean,
    resolve: (value?: PromiseLike<any> | any) => void
  ) {
    console.log('Done loading');
    if (reenableChangeRecording) {
      this.recordChanges = true;
    }
    resolve(true);
  }

  load(
    reenableChangeRecording: boolean = true,
    replace: boolean = true
  ): Promise<any> {
    return new Promise<any>((resolve) => {
      this.sharedState.showMapLoader.next(true);
      this.customImages.loadSignsInMemory().then(() => {
        // We need to make sure the custom images are loaded before we load the map - this is why we set it in sequence.
        this.mapStore.getMap(this.currentSessionId).then((map) => {
          this.loadElements(map, replace, reenableChangeRecording).then(() => {
            this.sharedState.showMapLoader.next(false);
            resolve('Elements loaded');
          });
        });
      });
    });
  }

  loadFromString(text, save: boolean, replace: boolean) {
    this.sharedState.showMapLoader.next(true);
    // //Deferred because we need to ensure that the loader is shown first
    // setTimeout(() => {
    this.loadElements(JSON.parse(text), replace).then(() => {
      this.sharedState.showMapLoader.next(false);
      if (save) {
        this.dirtyMap = true;
        this.save();
      }
    });
    // }, 0)
  }

  startDrawing(sign) {
    // this.select.setActive(false);
    this.currentDrawingSign = sign;
    if (sign) {
      this.toggleFilters([sign.src], false);
      let drawer = this.drawers[sign.type];
      if (!drawer) {
        drawer = this.drawers[sign.type] = new Draw({
          source: this.source,
          type: this.currentDrawingSign.type,
        });
        drawer.drawLayer = this;
        drawer.addEventListener('drawend', (event) => {
          this.endDrawing(event);
        });
        this.map.addInteraction(drawer);
      }
      drawer.setActive(true);
    }
  }

  endDrawing(event) {
    // this.select.setActive(true);
    event.feature.set('sig', this.currentDrawingSign);
    Object.values(this.drawers).forEach((drawer) => drawer.setActive(false));
    this.sharedState.selectFeature(event.feature);
  }

  removeFeature(feature) {
    if (feature != null) {
      this.toggleRemoveButton(false);
      this.source.removeFeature(feature);
      this.clearSelection();
    }
  }

  rotateProjection() {
    const nextIndex = this.selectedProjectionIndex + 1;
    this.selectedProjectionIndex = nextIndex >= availableProjections.length ? 0 : nextIndex;
    this.setSelectedFeatureCoordinates(this.selectedFeature);
  }

  setSelectedFeatureCoordinates(feature: Feature) {
    const center = getCenter(feature.getGeometry().getExtent());
    this.selectedFeatureCoordinates = transform(
      center,
      mercatorProjection,
      availableProjections[this.selectedProjectionIndex]
    );
  }

  private doDrawHole(drawHole: boolean) {
    if (drawHole) {
      Object.values(this.drawers).forEach((drawer) => drawer.setActive(false));
      this.drawHole.setActive(true);
    } else {
      this.drawHole.setActive(false);
    }
  }

  private toFront(feature: Feature) {
    feature.set('zindex', ++this.maxZIndex);
    this.layer.changed();
  }

  private toBack(feature: Feature) {
    feature.set('zindex', --this.minZIndex);
    this.layer.changed();
  }
}
