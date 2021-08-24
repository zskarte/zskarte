import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { I18NService } from '../i18n.service';
import { Sign } from '../entity/sign';
import { CustomImageStoreService } from '../custom-image-store.service';
import { SharedStateService } from '../shared-state.service';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'app-custom-images',
  templateUrl: './custom-images.component.html',
  styleUrls: ['./custom-images.component.css'],
})
export class CustomImagesComponent {
  sign: Sign;
  shareWithOthers: boolean;
  image;
  processedImage;
  originalImage;
  loading = false;
  keepOriginal = false;

  @ViewChild('importSymbol', { static: false }) el: ElementRef;
  @ViewChild('imageLoader', { static: false }) imgEl: ElementRef;
  @ViewChild('imageProcessor', { static: false }) imgProcessorEl: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Sign,
    public dialogRef: MatDialogRef<CustomImagesComponent>,
    public i18n: I18NService,
    private customImage: CustomImageStoreService,
    private sharedState: SharedStateService
  ) {
    this.load(data);
  }

  private load(sign: Sign) {
    this.sign = sign ? sign : { type: 'Point', src: null };
    this.shareWithOthers = !this.sign.onlyForSessionId;
    this.originalImage = this.sign.src
      ? CustomImageStoreService.getOriginalImageDataUrl(this.sign.src)
      : null;
    if (this.originalImage) {
      this.keepOriginal = true;
    }
    this.processedImage = this.sign.src
      ? CustomImageStoreService.getImageDataUrl(this.sign.src)
      : null;
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  processImage() {
    this.originalImage = this.toReducedOriginal();
    this.processedImage = this.toSymbol();
    const hash = Md5.hashStr(this.image).toString();
    if (CustomImageStoreService.isCustomImage(hash)) {
      this.load(CustomImageStoreService.getSign(hash));
    }
  }

  private toReducedOriginal(): string {
    const MAX_SIZE_OF_ORIGINAL_IMAGE = 700;
    const canvas = document.createElement('canvas');
    const iw = this.imgEl.nativeElement.naturalWidth;
    const ih = this.imgEl.nativeElement.naturalHeight;
    const vertical = ih > iw;
    if (vertical) {
      canvas.height =
        ih < MAX_SIZE_OF_ORIGINAL_IMAGE ? ih : MAX_SIZE_OF_ORIGINAL_IMAGE;
      canvas.width = (iw / ih) * canvas.height;
    } else {
      canvas.width =
        iw < MAX_SIZE_OF_ORIGINAL_IMAGE ? iw : MAX_SIZE_OF_ORIGINAL_IMAGE;
      canvas.height = (ih / iw) * canvas.width;
    }
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.imgEl.nativeElement, 0, 0, canvas.width, canvas.height);
    ctx.fill();
    return canvas.toDataURL('image/jpeg', 0.8);
  }

  private toSymbol(): string {
    const canvas = document.createElement('canvas');
    const iw = this.imgEl.nativeElement.naturalWidth;
    const ih = this.imgEl.nativeElement.naturalHeight;
    const vertical = ih > iw;
    const targetSize = Math.min(150, Math.min(iw, ih));
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d');
    const nw = vertical ? targetSize : (targetSize / ih) * iw;
    const nh = vertical ? (targetSize / iw) * ih : targetSize;
    ctx.drawImage(
      this.imgEl.nativeElement,
      (targetSize - nw) / 2,
      (targetSize - nw) / 2,
      nw,
      nh
    );
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      Math.min(canvas.width, canvas.height) / 2,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.fill();
    return canvas.toDataURL();
  }

  add(): void {
    this.loading = true;
    this.sign.onlyForSessionId = this.shareWithOthers
      ? null
      : this.sharedState.getCurrentSession().uuid;
    this.customImage
      .saveSign(
        this.sign,
        this.processedImage,
        this.keepOriginal ? this.originalImage : null,
        [
          this.imgProcessorEl.nativeElement.naturalWidth,
          this.imgProcessorEl.nativeElement.naturalHeight,
        ]
      )
      .then(() => {
        this.loading = false;
        this.dialogRef.close(this.sign);
      });
  }

  readFromFile() {
    this.loading = true;
    const reader = new FileReader();
    for (let index = 0; index < this.el.nativeElement.files.length; index++) {
      reader.onload = () => {
        this.loading = false;
        // this 'text' is the content of the file
        this.image = reader.result;
      };
      reader.readAsDataURL(this.el.nativeElement.files[index]);
    }
  }
}
