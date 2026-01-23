import { Component } from '@angular/core';

@Component({
  selector: 'app-form-section',
  standalone: true,
  template: '<ng-content></ng-content>',
  styles: `
    :host {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    @media (max-width: 768px) {
      :host {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class FormSectionComponent {}
