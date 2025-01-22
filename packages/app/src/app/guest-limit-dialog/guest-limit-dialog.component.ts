import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { I18NService } from '../state/i18n.service';

@Component({
  selector: 'app-guest-limit-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './guest-limit-dialog.component.html',
})
export class GuestLimitDialogComponent {
  i18n = inject(I18NService);
}
