import { Component, OnInit } from '@angular/core';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Sign, signCategories } from '../entity/sign';
import { DrawStyle } from '../drawlayer/draw-style';
import { Signs } from '../signs/signs';
import { I18NService } from '../i18n.service';
import { CustomImagesComponent } from '../custom-images/custom-images.component';
import { CustomImageStoreService } from '../custom-image-store.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-drawing-dialog',
  templateUrl: './drawing-dialog.component.html',
  styleUrls: ['./drawing-dialog.component.css'],
})
export class DrawingDialogComponent implements OnInit {
  filter: string = null;
  allSigns: Sign[] = null;
  filteredSigns: Sign[] = [];
  selected: string = null;
  signCategories = Array.from(signCategories.values());

  isCustomImage(sign: Sign) {
    return CustomImageStoreService.isCustomImage(sign.src);
  }

  loadSigns() {
    this.allSigns = Signs.SIGNS.concat(
      CustomImageStoreService.getAllSigns()
    ).sort((a, b) => {
      let aValue = a[this.i18n.locale];
      let bValue = b[this.i18n.locale];
      aValue = aValue ? aValue.toLowerCase() : '';
      bValue = bValue ? bValue.toLowerCase() : '';
      return aValue.localeCompare(bValue);
    });
    this.updateAvailableSigns();
  }

  updateAvailableSigns() {
    this.filteredSigns = this.allSigns.filter(
      (s) =>
        (!this.filter ||
          this.i18n.getLabelForSign(s).toLowerCase().includes(this.filter)) &&
        (!this.selected || this.selected === s.kat)
    );
  }

  constructor(
    public dialogRef: MatDialogRef<DrawingDialogComponent>,
    public i18n: I18NService,
    public dialog: MatDialog,
    private customImage: CustomImageStoreService
  ) {}

  getImageUrl(file: string) {
    if (file) {
      const customImageDataUrl = CustomImageStoreService.getImageDataUrl(file);
      if (customImageDataUrl) {
        return customImageDataUrl;
      }
      return DrawStyle.getImageUrl(file);
    }
    return null;
  }

  ngOnInit(): void {
    this.loadSigns();
  }

  select(sign: Sign) {
    // We need to pass a deep copy of the object
    this.dialogRef.close(JSON.parse(JSON.stringify(sign)));
  }

  capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  editSymbol(sign: Sign) {
    const symbolEdit = this.dialog.open(CustomImagesComponent, {
      data: sign,
      disableClose: true,
    });
    symbolEdit.afterClosed().subscribe((r) => {
      if (r) {
        this.loadSigns();
      }
    });
  }

  addSymbol() {
    const symbolAdd = this.dialog.open(CustomImagesComponent, {
      disableClose: true,
    });
    symbolAdd.afterClosed().subscribe((r) => {
      if (r) {
        const label = this.i18n.getLabelForSign(r);
        if (label) {
          this.filter = label;
        }
        this.loadSigns();
      }
    });
  }

  deleteSymbol(sign: Sign) {
    const confirm = this.dialog.open(ConfirmationDialogComponent, {
      data: this.i18n.get('deleteSymbolConfirm'),
    });
    confirm.afterClosed().subscribe((r) => {
      if (r) {
        this.customImage.deleteSign(sign.src).then(() => {
          this.loadSigns();
        });
      }
    });
  }
}
