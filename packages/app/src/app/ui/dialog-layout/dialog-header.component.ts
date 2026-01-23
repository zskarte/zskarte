import { Component, inject, output, input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { I18NService } from '../../state/i18n.service';

@Component({
  selector: 'app-dialog-header',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="header-content">
      <ng-content></ng-content>
    </div>
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
      gap: 1rem;
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
  autoClose = input(true);

  onClose() {
    this.close.emit();
    if (this.autoClose()) {
      this.dialogRef.close();
    }
  }
}
