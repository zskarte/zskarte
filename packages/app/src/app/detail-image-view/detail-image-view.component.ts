import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { I18NService } from '../state/i18n.service';
import { Sign } from '@zskarte/types';
import { DrawStyle } from '../map-renderer/draw-style';

@Component({
  selector: 'app-detail-image-view',
  templateUrl: './detail-image-view.component.html',
  styleUrls: ['./detail-image-view.component.scss'],
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
    if (data.id === 57) {
      // The gefahrentafel is generated on the fly
      this.imageSrc = DrawStyle.getHazardSignSvg(data);
    } else if (data.id === 210) {
      // The formation sign is generated on the fly
      this.imageSrc = DrawStyle.getFormationSvg(data);
    } else if ([190, 192, 201].includes(data.id ?? 0)) {
      // The transport sign is generated on the fly
      this.imageSrc = DrawStyle.getTransportSvg(data);
    } else if ([84, 60].includes(data.id ?? 0)) {
      // The leader sign is generated on the fly
      this.imageSrc = DrawStyle.getLeaderSignSvg(data);
    } else {
      this.imageSrc = DrawStyle.getImageUrl(data.src);
    }
  }
}
