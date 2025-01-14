import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { I18NService } from '../state/i18n.service';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
  imports: [MatDialogModule, MatStepperModule, MatButtonModule],
})
export class HelpComponent {
  initialLoad = inject(MAT_DIALOG_DATA);
  i18n = inject(I18NService);
}
