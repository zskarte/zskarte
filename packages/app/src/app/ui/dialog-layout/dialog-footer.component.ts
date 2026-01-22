import { Component } from '@angular/core';

@Component({
  selector: 'app-dialog-footer',
  standalone: true,
  template: '<ng-content></ng-content>',
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #dedede;
      background: white;
    }
  `,
})
export class DialogFooterComponent {}
