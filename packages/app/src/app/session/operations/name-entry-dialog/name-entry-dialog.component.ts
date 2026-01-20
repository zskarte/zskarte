import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { I18NService } from '../../../state/i18n.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-name-entry-dialog',
  templateUrl: './name-entry-dialog.component.html',
  styleUrls: ['./name-entry-dialog.component.scss'],
  imports: [MatFormFieldModule, MatInputModule, MatDialogModule, FormsModule, MatButtonModule],
})
export class NameEntryDialogComponent {
  dialogRef = inject<MatDialogRef<NameEntryDialogComponent>>(MatDialogRef);
  i18n = inject(I18NService);

  name = '';

  cancel(): void {
    this.dialogRef.close(null);
  }

  submit(): void {
    if (this.name.trim()) {
      this.dialogRef.close(this.name.trim());
    }
  }
}
