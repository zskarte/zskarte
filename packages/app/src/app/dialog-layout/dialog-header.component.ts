import { Component, inject, output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { I18NService } from '../state/i18n.service';

@Component({
  selector: 'app-dialog-header',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <ng-content></ng-content>
    <button
      type="button"
      mat-icon-button
      (click)="onClose()"
      [attr.aria-label]="i18n.get('close')"
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #dedede;
      background: white;
    }

    :host ::ng-deep h2 {
      margin: 0;
    }
  `,
})
export class DialogHeaderComponent {
  private dialogRef = inject(MatDialogRef);
  i18n = inject(I18NService);
  close = output();

  onClose() {
    this.close.emit();
    this.dialogRef.close();
  }
}
