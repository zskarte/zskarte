import { KeyboardHandlerContainer } from './../keyboard.service';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { I18NService } from '../i18n.service';

@Component({
  selector: 'app-shortcut-dialog',
  templateUrl: './shortcut-dialog.component.html',
  styleUrls: ['./shortcut-dialog.component.css'],
})
export class ShortcutDialogComponent {
  handlers: KeyboardHandlerContainer[];
  grouped = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public i18n: I18NService
  ) {
    this.handlers = data.handlers;
    //Get distinct group names without undefined
    const groups = [
      ...new Set(this.handlers.filter((h) => !!h.group).map((h) => h.group)),
    ];

    for (const g of groups) {
      this.grouped.push({
        key: i18n.get(g),
        values: this.handlers.filter((h) => h.group === g),
      });
    }

    this.grouped.sort((a, b) => {
      if (a > b) {
        return -1;
      }
      if (a < b) {
        return 1;
      }
      return 0;
    });

    //Make sure the general shortcuts are at the beginning
    this.grouped.unshift({
      key: i18n.get('general'),
      values: this.handlers.filter((h) => !h.group),
    });

    // for (const h of this.handlers) {
    //   const i = this.grouped.findIndex((g) => g.key === h.group);

    //   if (i !== -1) {
    //     this.grouped[i].values.push(h);
    //   } else {
    //     this.grouped.push({ key: h.group, values: [h] });
    //   }
    // }
  }
}
