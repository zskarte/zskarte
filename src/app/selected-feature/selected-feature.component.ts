import { Component, HostListener } from '@angular/core';
import { SharedStateService } from '../shared-state.service';
import {
  defineDefaultValuesForSignature,
  Sign,
  getColorForCategory,
} from '../entity/sign';
import { DrawStyle } from '../drawlayer/draw-style';
import { I18NService } from '../i18n.service';
import { MatDialog } from '@angular/material/dialog';
import { DrawingDialogComponent } from '../drawing-dialog/drawing-dialog.component';
import { CustomImageStoreService } from '../custom-image-store.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { DisplayMode } from '../entity/displayMode';
import { DetailImageViewComponent } from '../detail-image-view/detail-image-view.component';
import { Signs } from '../signs/signs';
import { MatSliderChange } from '@angular/material/slider';

@Component({
  selector: 'app-selected-feature',
  templateUrl: './selected-feature.component.html',
  styleUrls: ['./selected-feature.component.css'],
})
export class SelectedFeatureComponent {
  constructor(
    public dialog: MatDialog,
    private sharedState: SharedStateService,
    public i18n: I18NService
  ) {
    this.sharedState.currentFeature.subscribe((feature) => {
      if (feature && feature.get('features')) {
        if (feature.get('features').length === 1) {
          this.groupedFeatures = null;
          this.activeFeatureSelect(feature.get('features')[0]);
        } else {
          this.groupedFeatures = this.extractFeatureGroups(
            feature.get('features')
          );
        }
      } else {
        this.groupedFeatures = null;
        this.activeFeatureSelect(feature);
      }
    });
    this.sharedState.drawHoleMode.subscribe(
      (drawHoleMode) => (this.drawHoleMode = drawHoleMode)
    );
    this.sharedState.mergeMode.subscribe((m) => {
      this.mergeMode = m;
    });
    this.sharedState.displayMode.subscribe(
      (displayMode) => (this.editMode = displayMode !== DisplayMode.HISTORY)
    );
    this.editMode =
      this.sharedState.displayMode.getValue() !== DisplayMode.HISTORY;
  }

  get featureGroups() {
    // @ts-ignore
    return this.groupedFeatures
      ? Object.values(this.groupedFeatures).sort((a: any, b: any) =>
          a.label.localeCompare(b.label)
        )
      : null;
  }

  get isPolygon() {
    return ['Polygon', 'MultiPolygon'].includes(
      this.selectedFeature.getGeometry().getType()
    );
  }

  get isLine() {
    return this.selectedFeature.getGeometry().getType() === 'LineString';
  }

  get canSplit(): boolean {
    return (
      this.isPolygon &&
      this.selectedFeature != null &&
      this.selectedFeature.getGeometry().getCoordinates().length > 1
    );
  }

  groupedFeatures = null;
  editMode: boolean;
  selectedFeature: any = null;
  selectedSignature: Sign = null;
  drawHoleMode = false;
  mergeMode = false;

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
      value: getColorForCategory('danger'), //TODO
      viewValue: 'danger',
    },
    {
      value: getColorForCategory('effect'), // yellow #948B68
      viewValue: 'effects',
    },
  ];

  colorPicker = false;

  toggleColorSelection() {
    this.colorPicker = !this.colorPicker;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Only handle global events (to prevent input elements to be considered)
    const globalEvent = event.target instanceof HTMLBodyElement;
    if (globalEvent && this.selectedFeature && this.selectedSignature) {
      switch (event.key) {
        case 'Delete':
          this.delete();
          break;
        case '+':
          this.selectedSignature.strokeWidth += 0.1;
          this.redraw();
          break;
        case '-':
          this.selectedSignature.strokeWidth -= 0.1;
          this.redraw();
          break;
        case 'g':
          this.merge(true);
          break;
        case 'Escape':
          if (this.mergeMode) {
            this.merge(false);
          } else {
            this.sharedState.selectFeature(null);
          }
          break;
        case 'PageUp':
          this.bringToFront();
          break;
        case 'PageDown':
          this.sendToBack();
          break;
        case 'h':
          this.drawHole();
          break;
        case 'c':
          this.editCoordinates();
          break;
      }
    }
  }

  private extractFeatureGroups(allFeatures: any[]): any {
    const result = {};
    allFeatures.forEach((f) => {
      const sig = f.get('sig');
      const label = this.i18n.getLabelForSign(sig);
      let group = result[label];
      if (!group) {
        group = result[label] = {
          label: label,
        };
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

  private showFeature(feature) {
    if (feature && feature.getGeometry()) {
      this.sharedState.gotoCoordinate({
        lon: feature.getGeometry().getCoordinates()[0],
        lat: feature.getGeometry().getCoordinates()[1],
        mercator: true,
        center: false,
      });
    }
  }

  private hideFeature() {
    this.sharedState.gotoCoordinate(null);
  }

  private activeFeatureSelect(feature: any) {
    this.selectedFeature = feature;
    this.selectedSignature = feature ? feature.get('sig') : null;
    if (this.selectedSignature) {
      defineDefaultValuesForSignature(this.selectedSignature);
    }
  }

  toggleLockOfFeature() {
    // Reselect so the locking is handled appropriately
    this.sharedState.featureSource.next(this.selectedFeature);
    this.redraw();
  }

  redraw() {
    this.selectedFeature.changed();
  }

  addImage() {
    const dialogRef = this.dialog.open(DrawingDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.src) {
        this.selectedSignature.images.push(result.src);
        this.redraw();
      }
    });
  }

  removeImage(src: string) {
    this.selectedSignature.images.splice(
      this.selectedSignature.images.indexOf(src),
      1
    );
    this.redraw();
  }

  chooseSymbol() {
    const dialogRef = this.dialog.open(DrawingDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selectedSignature.src = result.src;
        this.selectedSignature.de = result.de;
        this.selectedSignature.fr = result.fr;
        this.selectedSignature.en = result.en;
        this.redraw();
      }
    });
  }

  removeSymbol() {
    this.selectedSignature.src = null;
    this.selectedSignature.de = null;
    this.selectedSignature.fr = null;
    this.selectedSignature.en = null;
    this.redraw();
  }

  editCoordinates() {
    this.sharedState.defineCoordinates.next(true);
  }

  delete() {
    const confirm = this.dialog.open(ConfirmationDialogComponent, {
      data: this.i18n.get('removeFeatureFromMapConfirm'),
    });
    confirm.afterClosed().subscribe((r) => {
      if (r) {
        this.sharedState.deleteFeature(this.selectedFeature);
      }
    });
  }

  getOriginalImageUrl(file: string) {
    return CustomImageStoreService.getOriginalImageDataUrl(file);
  }

  getImageUrl(file: string) {
    const imageFromStore = CustomImageStoreService.getImageDataUrl(file);
    if (imageFromStore) {
      return imageFromStore;
    }
    return DrawStyle.getImageUrl(file);
  }

  drawHole() {
    if (this.isPolygon) {
      this.sharedState.updateDrawHoleMode(!this.drawHoleMode);
    }
  }

  merge(merge: boolean) {
    if (merge && this.selectedFeature && this.isPolygon) {
      this.sharedState.setMergeMode(true);
    } else {
      this.sharedState.setMergeMode(false);
    }
  }

  split() {
    if (this.canSplit) {
      this.sharedState.setSplitMode(true);
    }
  }

  bringToFront() {
    this.sharedState.reorderFeature(true);
  }

  sendToBack() {
    this.sharedState.reorderFeature(false);
  }

  findSigBySrc(src) {
    const fromCustomStore = CustomImageStoreService.getSign(src);
    if (fromCustomStore) {
      return fromCustomStore;
    }
    return Signs.getSignBySource(src);
  }

  openImageDetail(sig) {
    this.dialog.open(DetailImageViewComponent, { data: sig });
  }

  setSliderValueOnSignature(field: string, event: MatSliderChange) {
    const updateProp = (object: any, path: string[], value: any) => {
      if (path.length === 1) object[path[0]] = value;
      else if (path.length === 0) throw new Error('path not found');
      else {
        if (object[path[0]])
          return updateProp(object[path[0]], path.slice(1), value);
        else {
          object[path[0]] = {};
          return updateProp(object[path[0]], path.slice(1), value);
        }
      }
    };
    updateProp(this.selectedSignature, field.split('.'), event.value);
    this.redraw();
  }
}
