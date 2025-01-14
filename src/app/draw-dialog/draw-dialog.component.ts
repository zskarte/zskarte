import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { I18NService } from '../state/i18n.service';
import { Sign } from '../core/entity/sign';
import { ZsMapBaseLayer } from '../map-renderer/layers/base-layer';
import { ZsMapDrawElementStateType } from '../state/interfaces';
import { MatIconModule } from '@angular/material/icon';
import { SelectSignDialog } from '../select-sign-dialog/select-sign-dialog.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-draw-dialog',
  templateUrl: './draw-dialog.component.html',
  styleUrl: './draw-dialog.component.scss',
  imports: [MatIconModule, SelectSignDialog, MatButtonModule],
})
export class DrawDialogComponent {
  dialogRef = inject<MatDialogRef<DrawDialogComponent>>(MatDialogRef);
  i18n = inject(I18NService);
  dialog = inject(MatDialog);

  public layer: ZsMapBaseLayer | undefined;

  public setLayer(layer: ZsMapBaseLayer | undefined): void {
    this.layer = layer;
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

  public startFreehand(): void {
    this.dialogRef.close();
    this.layer?.draw(ZsMapDrawElementStateType.FREEHAND);
  }

  public signSelected(sign: Sign): void {
    this.dialogRef.close();
    this.layer?.draw(ZsMapDrawElementStateType.SYMBOL, { symbolId: sign.id });
  }
}
