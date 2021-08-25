import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Sign } from '../entity/sign';
import { CustomImageStoreService } from '../custom-image-store.service';
import { DrawStyle } from '../drawlayer/draw-style';
import { I18NService } from '../i18n.service';

@Component({
  selector: 'app-detail-image-view',
  templateUrl: './detail-image-view.component.html',
  styleUrls: ['./detail-image-view.component.css'],
})
export class DetailImageViewComponent {
  title;
  imageSrc;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Sign,
    public i18n: I18NService
  ) {
    this.title = i18n.getLabelForSign(data);
    this.imageSrc = CustomImageStoreService.getOriginalImageDataUrl(data.src);
    if (!this.imageSrc) {
      this.imageSrc = CustomImageStoreService.getImageDataUrl(data.src);
    }
    if (!this.imageSrc) {
      this.imageSrc = DrawStyle.getImageUrl(data.src);
    }
  }
}
