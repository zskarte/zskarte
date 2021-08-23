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
