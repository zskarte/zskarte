import { Component, OnInit, inject } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { I18NService } from '../state/i18n.service';
import { ZsMapBaseLayer } from '../map-renderer/layers/base-layer';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Sign, ZsMapDrawElementStateType, signCategories } from '@zskarte/types';
import { DialogHeaderComponent, DialogBodyComponent, DialogFooterComponent } from '../ui/dialog-layout';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { A11yModule } from '@angular/cdk/a11y';
import { Signs } from '../map-renderer/signs';
import { DrawStyle } from '../map-renderer/draw-style';
import { SessionService } from '../session/session.service';
import { RecentlyUsedSignsComponent } from '../recently-used-signs/recently-used-signs.component';
import capitalizeFirstLetter from '../helper/capitalizeFirstLetter';

@Component({
  selector: 'app-draw-dialog',
  templateUrl: './draw-dialog.component.html',
  styleUrl: './draw-dialog.component.scss',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    DialogHeaderComponent,
    DialogBodyComponent,
    DialogFooterComponent,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    A11yModule,
    RecentlyUsedSignsComponent,
  ],
})
export class DrawDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<DrawDialogComponent>>(MatDialogRef);
  i18n = inject(I18NService);
  dialog = inject(MatDialog);
  private _session = inject(SessionService);

  public layer: ZsMapBaseLayer | undefined;

  // Sign selection properties
  filter = '';
  allSigns: Sign[] = [];
  filteredSigns: Sign[] = [];
  selected = '';
  hiddenTypes = ['incident'];
  signCategories = Array.from(signCategories.values()).filter((c) => !this.hiddenTypes.includes(c.name));
  capitalizeFirstLetter = capitalizeFirstLetter;

  public setLayer(layer: ZsMapBaseLayer | undefined): void {
    this.layer = layer;
  }

  ngOnInit(): void {
    this.loadSigns();
  }

  loadSigns() {
    this.allSigns = Signs.SIGNS.filter((sign) => !sign.deprecated).sort((a, b) => {
      let aValue = a[this._session.getLocale()];
      let bValue = b[this._session.getLocale()];
      aValue = aValue ? aValue.toLowerCase() : '';
      bValue = bValue ? bValue.toLowerCase() : '';
      return aValue.localeCompare(bValue);
    });
    this.updateAvailableSigns();
  }

  updateAvailableSigns() {
    this.filteredSigns = this.allSigns.filter(
      (s) =>
        (!this.filter || this.i18n.getLabelForSign(s).toLowerCase().includes(this.filter.toLowerCase())) &&
        (!this.selected || this.selected === s.kat) &&
        !this.hiddenTypes.includes(s.kat ?? ''),
    );
  }

  getImageUrl(file: string) {
    if (file) {
      return DrawStyle.getImageUrl(file);
    }
    return null;
  }

  getIconFromType(type: string) {
    switch (type) {
      case 'Polygon':
        return 'widgets';
      case 'LineString':
        return 'show_chart';
      case 'Point':
        return 'stars';
      default:
        return 'block';
    }
  }

  selectSign(sign: Sign) {
    this.dialogRef.close();
    this.layer?.draw(ZsMapDrawElementStateType.SYMBOL, { symbolId: sign.id });
  }

  public addLine(): void {
    this.dialogRef.close();
    this.layer?.draw(ZsMapDrawElementStateType.LINE);
  }

  public addText(): void {
    this.dialogRef.close();
    this.layer?.draw(ZsMapDrawElementStateType.TEXT);
  }

  public addPolygon(): void {
    this.dialogRef.close();
    this.layer?.draw(ZsMapDrawElementStateType.POLYGON);
  }

  public addRectangle(): void {
    this.dialogRef.close();
    this.layer?.draw(ZsMapDrawElementStateType.RECTANGLE);
  }

  public addCircle(): void {
    this.dialogRef.close();
    this.layer?.draw(ZsMapDrawElementStateType.CIRCLE);
  }

  public startFreehand(): void {
    this.dialogRef.close();
    this.layer?.draw(ZsMapDrawElementStateType.FREEHAND);
  }
}
