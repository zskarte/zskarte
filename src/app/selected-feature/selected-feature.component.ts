/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, OnDestroy, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { DetailImageViewComponent } from '../detail-image-view/detail-image-view.component';
import { I18NService } from '../state/i18n.service';
import { FillStyle, getColorForCategory, Sign, signatureDefaultValues } from '../core/entity/sign';
import { ZsMapStateService } from '../state/state.service';
import { Signs } from '../map-renderer/signs';
import { DrawStyle } from '../map-renderer/draw-style';
import { BehaviorSubject, EMPTY, firstValueFrom, Observable, Subject } from 'rxjs';
import { Feature } from 'ol';
import { SimpleGeometry } from 'ol/geom';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { ZsMapDrawElementState, ZsMapDrawElementStateType } from '../state/interfaces';
import { EditCoordinatesComponent } from '../edit-coordinates/edit-coordinates.component';
import { ZsMapBaseDrawElement } from '../map-renderer/elements/base/base-draw-element';
import { SelectSignDialog } from '../select-sign-dialog/select-sign-dialog.component';
import { AsyncPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { StackComponent } from '../stack/stack.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-selected-feature',
  templateUrl: './selected-feature.component.html',
  styleUrls: ['./selected-feature.component.scss'],
  imports: [
    AsyncPipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatExpansionModule,
    DatePipe,
    MatIconModule,
    MatSliderModule,
    StackComponent,
    MatButtonModule,
    MatCheckboxModule,
  ],
})
export class SelectedFeatureComponent implements OnDestroy {
  dialog = inject(MatDialog);
  i18n = inject(I18NService);
  zsMapStateService = inject(ZsMapStateService);

  groupedFeatures = null;
  editMode = new BehaviorSubject(true);
  selectedFeature: Observable<Feature<SimpleGeometry> | undefined>;
  selectedSignature: Observable<Sign | undefined>;
  selectedDrawElement: Observable<ZsMapDrawElementState | undefined>;
  drawHoleMode: Observable<boolean>;
  mergeMode: Observable<boolean>;
  featureType?: string;
  useColorPicker = false;
  // we only show the affected persons for Dead, Trapped, Missing, Homeless and Injured
  personSigns = [39, 82, 112, 122, 123];
  private _drawElementCache: Record<string, ZsMapBaseDrawElement> = {};
  private _ngUnsubscribe = new Subject<void>();

  quickColors = [
    {
      value: getColorForCategory('damage'), // red
      viewValue: 'damage',
    },
    {
      value: getColorForCategory('action'), // blue
      viewValue: 'resources',
    },
    {
      value: getColorForCategory('danger'), // red
      viewValue: 'danger',
    },
    {
      value: getColorForCategory('effect'), // yellow #948B68
      viewValue: 'effects',
    },
  ];

  constructor() {
    this.selectedFeature = this.zsMapStateService.observeSelectedElement$().pipe(
      takeUntil(this._ngUnsubscribe),
      map((element) => element?.getOlFeature() as Feature<SimpleGeometry> | undefined),
    );
    this.selectedDrawElement = this.zsMapStateService.observeSelectedElement$().pipe(
      takeUntil(this._ngUnsubscribe),
      switchMap((element) => element?.observeElement() ?? EMPTY),
    );
    this.selectedSignature = this.zsMapStateService.observeSelectedElement$().pipe(
      takeUntil(this._ngUnsubscribe),
      map((element) => {
        const sig = element?.getOlFeature()?.get('sig');
        if (!sig) return undefined;
        const signById = sig.id ? Signs.getSignById(sig.id) : { ...sig };
        signById.createdBy = element?.elementState?.createdBy;
        return signById;
      }),
    );

    this.selectedFeature.pipe(takeUntil(this._ngUnsubscribe)).subscribe((feature) => {
      if (feature?.get('features')) {
        if (feature.get('features').length === 1) {
          this.groupedFeatures = null;
          this.featureType = feature.get('features')[0].getGeometry()?.getType();
        } else {
          this.groupedFeatures = this.extractFeatureGroups(feature.get('features'));
        }
      } else {
        this.groupedFeatures = null;
        this.featureType = feature?.getGeometry()?.getType();
      }
    });

    this.zsMapStateService
      .observeIsReadOnly()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((isReadOnly) => {
        this.editMode.next(!isReadOnly);
      });

    this.zsMapStateService
      .observeDrawElements()
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((drawElements) => {
        for (const element of drawElements) {
          if (!this._drawElementCache[element.getId()]) {
            this._drawElementCache[element.getId()] = element;
          }
        }
      });

    this.drawHoleMode = this.zsMapStateService.observeDrawHoleMode().pipe(takeUntil(this._ngUnsubscribe));
    this.mergeMode = this.zsMapStateService.observeMergeMode().pipe(takeUntil(this._ngUnsubscribe));
  }

  public ngOnDestroy(): void {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  get featureGroups() {
    return this.groupedFeatures ? Object.values(this.groupedFeatures).sort((a: any, b: any) => a.label.localeCompare(b.label)) : null;
  }

  isPolygon() {
    return ['Polygon', 'MultiPolygon'].includes(this.featureType ?? '');
  }

  isLine() {
    return this.featureType === 'LineString';
  }

  // skipcq: JS-0105
  isText(element?: ZsMapDrawElementState) {
    if (!element) return false;
    return element.type === ZsMapDrawElementStateType.TEXT;
  }

  canSplit(element: ZsMapDrawElementState) {
    if (!element?.id) {
      return false;
    }

    const point = this._drawElementCache[element.id].getOlFeature()?.getGeometry() as SimpleGeometry;
    return this.isPolygon() && this.selectedFeature !== null && (point?.getCoordinates()?.length ?? 0) > 1;
  }

  private extractFeatureGroups(allFeatures: any[]): any {
    const result = {};
    allFeatures.forEach((f) => {
      const sig = f.get('sig');
      const label = this.i18n.getLabelForSign(sig);
      let group = result[label];
      if (!group) {
        group = result[label] = { label };
      }
      if (!group.src && sig.src) {
        group.src = sig.src;
      }
      if (!group.features) {
        group.features = [];
      }
      group.features.push(f);
    });
    return result;
  }

  updateProperty<T extends keyof ZsMapDrawElementState>(
    element: ZsMapDrawElementState,
    field: T | string,
    value: ZsMapDrawElementState[T],
  ) {
    const el = this._drawElementCache[element?.id ?? ''];
    if (el) {
      // Update the signature in the UI separately from the state, to provide a smooth update of all properties
      el.getOlFeature().get('sig')[field] = value;
      el.getOlFeature().changed();
      el.updateElementState((draft) => {
        draft[field as T] = value;
      });
    }
  }

  updateFillStyle<T extends keyof FillStyle>(element: ZsMapDrawElementState, field: T, value: FillStyle[T]) {
    if (element.id) {
      this.zsMapStateService.updateDrawElementState(
        element.id,
        'fillStyle',
        SelectedFeatureComponent.getUpdatedFillStyle(element, field, value),
      );
    }
  }

  static getUpdatedFillStyle<T extends keyof FillStyle>(element: ZsMapDrawElementState, field: T, value: FillStyle[T]): FillStyle {
    return { ...element.fillStyle, [field]: value } as FillStyle;
  }

  chooseSymbol(drawElement: ZsMapDrawElementState) {
    const dialogRef = this.dialog.open(SelectSignDialog);
    dialogRef.afterClosed().subscribe((result: Sign) => {
      if (result) {
        this.updateProperty(drawElement, 'symbolId', result.id);

        this.zsMapStateService.setSelectedFeature(drawElement.id);
      }
    });
  }

  async editCoordinates() {
    const selectedElement = await firstValueFrom(this.zsMapStateService.observeSelectedElement$());
    if (selectedElement) {
      const editDialog = this.dialog.open(EditCoordinatesComponent, {
        data: {
          geometry: selectedElement.getOlFeature().getGeometry()?.getType(),
          coordinates: selectedElement.elementState?.coordinates,
        },
        maxWidth: '100vw',
      });
      editDialog.afterClosed().subscribe((result) => {
        if (result) {
          selectedElement.setCoordinates(result);
        }
      });
    }
  }

  copy(drawElement: ZsMapDrawElementState) {
    if (!drawElement.symbolId) {
      return;
    }
    const layer = this.zsMapStateService.getActiveLayer();
    if (layer) {
      this.zsMapStateService.copySymbol(drawElement.symbolId, layer.getId());
      this.zsMapStateService.resetSelectedFeature();
    }
  }

  delete(drawElement: ZsMapDrawElementState) {
    if (!drawElement.id) {
      return;
    }

    const confirm = this.dialog.open(ConfirmationDialogComponent, {
      data: this.i18n.get('removeFeatureFromMapConfirm'),
    });
    confirm.afterClosed().subscribe((r) => {
      if (r && drawElement.id) {
        this.zsMapStateService.removeDrawElement(drawElement.id);
        this.zsMapStateService.resetSelectedFeature();
      }
    });
  }

  // skipcq: JS-0105
  getImageUrl(file: string) {
    // const imageFromStore = CustomImageStoreService.getImageDataUrl(file);
    // if (imageFromStore) {
    //   return imageFromStore;
    // }
    return DrawStyle.getImageUrl(file);
  }

  drawHole() {
    this.zsMapStateService.toggleDrawHoleMode();
  }

  merge(merge: boolean) {
    if (merge && this.isPolygon()) {
      this.zsMapStateService.setMergeMode(true);
    } else {
      this.zsMapStateService.setMergeMode(false);
    }
  }

  split(element: ZsMapDrawElementState) {
    this.zsMapStateService.splitPolygon(this._drawElementCache[element.id ?? '']);
  }

  bringToFront(element: ZsMapDrawElementState) {
    const maxZIndex = Math.max(...Object.values(this._drawElementCache).map((el) => el.elementState?.zindex ?? 0));
    this.updateProperty(element, 'zindex', maxZIndex + 1);
  }

  sendToBack(element: ZsMapDrawElementState) {
    const minZIndex = Math.min(...Object.values(this._drawElementCache).map((el) => el.elementState?.zindex ?? 0));
    this.updateProperty(element, 'zindex', minZIndex - 1);
  }

  openImageDetail(sig: any) {
    this.dialog.open(DetailImageViewComponent, { data: sig });
  }

  resetSignature(element: ZsMapDrawElementState) {
    if (!element.id) return;
    this.zsMapStateService.updateDrawElementState(element.id, 'iconSize', signatureDefaultValues.iconSize);
    this.zsMapStateService.updateDrawElementState(element.id, 'iconOffset', signatureDefaultValues.iconOffset);
    this.zsMapStateService.updateDrawElementState(element.id, 'rotation', signatureDefaultValues.rotation);
    this.zsMapStateService.updateDrawElementState(element.id, 'flipIcon', signatureDefaultValues.flipIcon);
    this.zsMapStateService.updateDrawElementState(element.id, 'iconOpacity', signatureDefaultValues.iconOpacity);
    this.zsMapStateService.updateDrawElementState(element.id, 'hideIcon', signatureDefaultValues.hideIcon);
  }

  resetLine(element: ZsMapDrawElementState) {
    if (!element.id) return;
    this.zsMapStateService.updateDrawElementState(element.id, 'style', signatureDefaultValues.style);
    this.zsMapStateService.updateDrawElementState(element.id, 'strokeWidth', signatureDefaultValues.strokeWidth);
    this.zsMapStateService.updateDrawElementState(element.id, 'arrow', signatureDefaultValues.arrow);
  }

  resetPolygon(element: ZsMapDrawElementState) {
    if (!element.id) return;
    this.updateFillStyle(element, 'name', signatureDefaultValues.fillStyle.name);
  }
}
