import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { I18NService } from '../state/i18n.service';
import { Sign } from '@zskarte/types';
import { DrawStyle } from '../map-renderer/draw-style';
import { DialogBodyComponent, DialogFooterComponent, DialogHeaderComponent } from '../ui/dialog-layout';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-detail-image-view',
  templateUrl: './detail-image-view.component.html',
  styleUrls: ['./detail-image-view.component.scss'],
  imports: [DialogHeaderComponent, DialogBodyComponent, DialogFooterComponent, MatDialogModule, MatButtonModule],
})
export class DetailImageViewComponent {
  data = inject<Sign>(MAT_DIALOG_DATA);
  i18n = inject(I18NService);

  title: string;
  imageSrc: string;

  constructor() {
    const data = this.data;
    const i18n = this.i18n;

    this.title = i18n.getLabelForSign(data);
    this.imageSrc = DrawStyle.getSignatureURI(data);
  }
}
