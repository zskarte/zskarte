import { Injectable, inject } from '@angular/core';
import { Collection, Feature } from 'ol';
import { Extent, getCenter } from 'ol/extent';
import { Polygon } from 'ol/geom';
import { Translate } from 'ol/interaction';
import Draw, { createBox } from 'ol/interaction/Draw';
import { Layer } from 'ol/layer';
import VectorLayer from 'ol/layer/Vector';
import { getPointResolution } from 'ol/proj';
import TileSource from 'ol/source/Tile';
import VectorSource from 'ol/source/Vector';
import { skip } from 'rxjs';
import { IZsMapPrintState } from '../../../../types';
import { DEFAULT_COORDINATES, DEFAULT_RESOLUTION, MM_PER_INCHES } from '../session/default-map-values';
import { ZsMapStateService } from '../state/state.service';
import { LAYER_Z_INDEX_PRINT_DIMENSIONS, MapRendererService } from './map-renderer.service';
import { ModifyRectangle, ModifyRectangleEvent } from './modify-rectangle.interaction';

@Injectable({
  providedIn: 'root',
})
export class MapPrintService {
  private _disabledForPrint = false;
  private _state = inject(ZsMapStateService);
  private _printDimensionLayer!: VectorLayer<VectorSource>;
  private _printDimensionArea!: Feature<Polygon>;
  private _printAreaInteraction: Draw | undefined;
  private _printAreaModifyInteraction: ModifyRectangle | undefined;
  private _printAreaPositionInteraction: Translate | undefined;
  private _renderer!: MapRendererService;

  initialize({
    renderer,
  }: {
    renderer: MapRendererService;
  }) {
    this._renderer = renderer;

    this._printDimensionArea = new Feature({
      geometry: new Polygon([
        [
          renderer.getView().getCenter() || DEFAULT_COORDINATES,
          renderer.getView().getCenter() || DEFAULT_COORDINATES,
          renderer.getView().getCenter() || DEFAULT_COORDINATES,
        ],
      ]),
    });
    const printDimensionSource = new VectorSource({
      features: [this._printDimensionArea],
    });

    this._printDimensionLayer = new VectorLayer({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      source: printDimensionSource as any,
      visible: false,
    });
    this._printDimensionLayer.setZIndex(LAYER_Z_INDEX_PRINT_DIMENSIONS);
    renderer.getMap().addLayer(this._printDimensionLayer);

    this._state
      .observePrintExtent()
      .pipe(skip(1))
      .subscribe((extent) => {
        this._updatePrintViewExtent(extent);
      });

    this._state
      .observePrintState()
      .pipe(skip(2))
      .subscribe((printState) => {
        if (printState.printView && printState.emptyMap) {
          renderer.getLayers().forEach((l) => {
            l.setVisible(false);
          });
        } else {
          renderer.getLayers().forEach((l) => {
            l.setVisible(true);
          });
        }
        this._printDimensionLayer.setVisible(printState.printView && !this._disabledForPrint);
        this._updatePrintViewInteractions(printState);
        this._updatePrintViewCallbacks(printState);
      });
  }

  private _updatePrintViewExtent(printExtent) {
    let printCenter = this._state.getPrintCenter();
    if (!printCenter) {
      printCenter = this._renderer.getView().getCenter();
      if (printCenter) {
        this._state.updatePrintState((draft: IZsMapPrintState) => {
          draft.printCenter = printCenter;
        });
      }
    }
    if (printCenter) {
      const geometry = this._printDimensionArea.getGeometry();
      if (geometry) {
        const scale = printExtent.scale ?? printExtent.autoScaleVal ?? 10;
        /*
        const dpi = printExtent.dpi;
        const resolution = (scale * 1000) / INCHES_PER_METER / dpi;
        const pointResolution = getPointResolution(this._view.getState().projection, resolution, printCenter, 'm');
        const reversePointResolution = (resolution / pointResolution) * resolution;
        const deltaX = (reversePointResolution * ((printExtent.dimensions[0] / MM_PER_INCHES) * dpi)) / 2;
        const deltaY = (reversePointResolution * ((printExtent.dimensions[1] / MM_PER_INCHES) * dpi)) / 2;
        */
        const resolution = scale;
        const pointResolution = getPointResolution(
          this._renderer.getView().getState().projection,
          resolution,
          printCenter,
          'm',
        );
        const reversePointResolution = (resolution / pointResolution) * resolution;
        const deltaX = (reversePointResolution * printExtent.dimensions[0]) / 2;
        const deltaY = (reversePointResolution * printExtent.dimensions[1]) / 2;
        const boxCoordinates = [
          [
            [printCenter[0] - deltaX, printCenter[1] - deltaY],
            [printCenter[0] + deltaX, printCenter[1] - deltaY],
            [printCenter[0] + deltaX, printCenter[1] + deltaY],
            [printCenter[0] - deltaX, printCenter[1] + deltaY],
            [printCenter[0] - deltaX, printCenter[1] - deltaY],
          ],
        ];
        geometry.setCoordinates(boxCoordinates);
      }
    }
  }

  private _updatePrintViewInteractions(printState: IZsMapPrintState) {
    if (printState.printView) {
      //disable normal map manipulation interactions
      this._renderer.getMapInteractions().forEach((i) => {
        i.setActive(false);
      });
      if (!printState.scale) {
        if (this._printAreaPositionInteraction) {
          this._renderer.getMap().removeInteraction(this._printAreaPositionInteraction);
          this._printAreaPositionInteraction = undefined;
        }
        //allow to select area to print
        if (!this._printAreaInteraction) {
          const draw = new Draw({
            type: 'Circle',
            geometryFunction: createBox(),
          });
          draw.on('drawend', (event) => {
            const geometry = event?.feature?.getGeometry() as Polygon;
            if (geometry) {
              this._printDimensionArea.getGeometry()?.setCoordinates(geometry.getCoordinates());
              this._updatePrintArea(geometry.getExtent());
              this._printDimensionLayer?.getSource()?.removeFeature(event.feature);
            }
          });
          this._printAreaInteraction = draw;
          this._renderer.getMap().addInteraction(this._printAreaInteraction);
        }
        if (!this._printAreaModifyInteraction) {
          this._printAreaModifyInteraction = new ModifyRectangle({
            features: new Collection([this._printDimensionArea]),
          });
          this._printAreaModifyInteraction.on('modifyrectangleend', (event: ModifyRectangleEvent) => {
            const geometry = event.modifyFeature.getGeometry();
            if (geometry) {
              this._updatePrintArea(geometry.getExtent());
            }
          });
          this._renderer.getMap().addInteraction(this._printAreaModifyInteraction);
        }
      } else {
        if (this._printAreaInteraction) {
          this._renderer.getMap().removeInteraction(this._printAreaInteraction);
          this._printAreaInteraction = undefined;
        }
        if (this._printAreaModifyInteraction) {
          this._renderer.getMap().removeInteraction(this._printAreaModifyInteraction);
          this._printAreaModifyInteraction = undefined;
        }
        //allow to move area to print
        if (!this._printAreaPositionInteraction) {
          const translate = new Translate({
            layers: [this._printDimensionLayer],
          });
          translate.on('translateend', (event) => {
            if (event.features && event.features.getLength() > 0) {
              const geometry = event.features.getArray()[0].getGeometry();
              if (geometry) {
                this._state.updatePrintState((draft: IZsMapPrintState) => {
                  const extend = geometry.getExtent();
                  draft.printCenter = getCenter(extend);
                });
              }
            }
          });
          this._printAreaPositionInteraction = translate;
          this._renderer.getMap().addInteraction(this._printAreaPositionInteraction);
        }
      }
    } else {
      //reenable normal map manipulation interactions
      this._renderer.getMapInteractions().forEach((i) => {
        i.setActive(true);
      });
      if (this._printAreaInteraction) {
        this._renderer.getMap().removeInteraction(this._printAreaInteraction);
        this._printAreaInteraction = undefined;
      }
      if (this._printAreaModifyInteraction) {
        this._renderer.getMap().removeInteraction(this._printAreaModifyInteraction);
        this._printAreaModifyInteraction = undefined;
      }
      if (this._printAreaPositionInteraction) {
        this._renderer.getMap().removeInteraction(this._printAreaPositionInteraction);
        this._printAreaPositionInteraction = undefined;
      }
    }
  }

  private _updatePrintViewCallbacks(printState: IZsMapPrintState) {
    if (printState.printView && printState.generateCallback && !this._disabledForPrint) {
      document.body.style.cursor = 'progress';
      this._disabledForPrint = true;
      //prevent map changes while prepare image for pdf generation
      this._renderer
        .getMap()
        .getInteractions()
        .forEach((i) => {
          i.setActive(false);
        });
      //backup map size settings
      this._state.updatePrintState((draft: IZsMapPrintState) => {
        draft.backupResolution = this._renderer.getView().getResolution();
        draft.backupDpi = this._state.getDPI();
      });

      //don't print print area selection
      this._printDimensionLayer.setVisible(false);

      //add callback handlers
      this._renderer.getMap().once('rendercomplete', printState.generateCallback);
      if (printState.tileEventCallback) {
        const tileSources = this._renderer
          .getMap()
          .getLayers()
          .getArray()
          .filter((l): l is Layer => Boolean(l))
          .map((l) => l.getSource())
          .filter((l): l is TileSource => Boolean(l));
        const tileEventCallback = printState.tileEventCallback;
        tileSources.forEach((s) => s.on(['tileloadstart', 'tileloadend', 'tileloaderror'], tileEventCallback));
        //auto remove tileEventCallback after render complete / generateCallback callen
        this._renderer.getMap().once('rendercomplete', () => {
          if (tileEventCallback) {
            tileSources.forEach((s) => s.un(['tileloadstart', 'tileloadend', 'tileloaderror'], tileEventCallback));
          }
        });
      }
      this._setPrintViewSize(printState);
    } else if (!printState.generateCallback && this._disabledForPrint) {
      this._disabledForPrint = false;
      this._renderer
        .getMap()
        .getInteractions()
        .forEach((i) => {
          if (!this._renderer.getMapInteractions().includes(i)) {
            i.setActive(true);
          }
        });
      this._printDimensionLayer.setVisible(true);

      this._resetPrintViewSize(printState);
    }
  }

  private _setPrintViewSize(printState) {
    //set map size / settings for generate map image for defined pdf format
    const width = Math.round((printState.dimensions[0] * printState.dpi) / MM_PER_INCHES);
    const height = Math.round((printState.dimensions[1] * printState.dpi) / MM_PER_INCHES);
    const scale = printState.scale ?? printState.autoScaleVal ?? 50;
    const printCenter = printState.printCenter ?? this._renderer.getView().getCenter() ?? DEFAULT_COORDINATES;
    const scaleResolution =
      scale / getPointResolution(this._renderer.getView().getProjection(), printState.dpi / MM_PER_INCHES, printCenter);
    this._renderer.getScaleLine().setDpi(printState.dpi);
    this._renderer.getMap().getTargetElement().style.width = `${width}px`;
    this._renderer.getMap().getTargetElement().style.height = `${height}px`;
    this._renderer.getMap().updateSize();
    this._renderer
      .getMap()
      .getLayers()
      .getArray()
      .filter((l): l is Layer => Boolean(l))
      .filter((l) => l.isVisible())
      .map((l) => l.getSource())
      .filter((l): l is TileSource => Boolean(l))
      .forEach((s) => {
        let tileCount: number | undefined;
        if ('updateCacheSize' in s) {
          if ('getTileGridForProjection' in s) {
            const tileGrid = s.getTileGridForProjection(this._renderer.getView().getProjection());
            const zoom = tileGrid.getZForResolution(this._renderer.getView().getResolution() ?? DEFAULT_RESOLUTION);
            const extent = this._renderer.getView().calculateExtent(this._renderer.getMap().getSize());
            const tileRange = tileGrid.getTileRangeForExtentAndZ(extent, zoom);
            tileCount = (tileRange.maxX - tileRange.minX + 1) * (tileRange.maxY - tileRange.minY + 1);
            tileCount = Math.round(tileCount * 1.1);
          }
          if (tileCount) {
            if (tileCount > 512) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (s.updateCacheSize as any)(tileCount, this._renderer.getView().getProjection());
            }
            if (printState.tileEventCallback) {
              printState.tileEventCallback(
                new CustomEvent<{ tileCount: number }>('tileCountInfo', { detail: { tileCount } }),
              );
            }
          }
        }
      });
    this._renderer.getView().setCenter(printCenter);
    this._renderer.getView().setResolution(scaleResolution);
  }

  private _resetPrintViewSize(printState) {
    //reset normal map size / settings
    this._renderer.getScaleLine().setDpi(printState.backupDpi);
    this._renderer.getMap().getTargetElement().style.width = '';
    this._renderer.getMap().getTargetElement().style.height = '';
    this._renderer.getMap().updateSize();
    this._renderer.getView().setResolution(printState.backupResolution);
    document.body.style.cursor = 'auto';
    this._state.updatePrintState((draft: IZsMapPrintState) => {
      draft.backupResolution = undefined;
      draft.backupDpi = undefined;
    });
  }

  private _updatePrintArea(extent: Extent) {
    this._state.updatePrintState((draft: IZsMapPrintState) => {
      draft.printCenter = getCenter(extent);
      /*
      const printPixelSize = [(draft.dimensions[0] / MM_PER_INCHES) * draft.dpi, (draft.dimensions[1] / MM_PER_INCHES) * draft.dpi];
      const extendResolution = this._view.getResolutionForExtent(extend, printPixelSize);
      const resolution = getPointResolution(this._view.getState().projection, extendResolution, draft.printCenter, 'm');
      draft.autoScaleVal = (resolution * INCHES_PER_METER * draft.dpi) / 1000;
      */
      const extendResolution = this._renderer.getView().getResolutionForExtent(extent, draft.dimensions);
      const resolution = getPointResolution(
        this._renderer.getView().getState().projection,
        extendResolution,
        draft.printCenter,
        'm',
      );
      draft.autoScaleVal = resolution;
    });
  }
}
