import { Component } from '@angular/core';

@Component({
  selector: 'app-dialog-body',
  standalone: true,
  template: '<ng-content></ng-content>',
  styles: `
    :host {
      display: block;
      overflow-y: auto;
      flex: 1;
    }
  `,
})
export class DialogBodyComponent {}
