import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { I18NService } from '../../../state/i18n.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DialogBodyComponent, DialogFooterComponent, DialogHeaderComponent } from '../../../ui/dialog-layout';

@Component({
  selector: 'app-name-entry-dialog',
  templateUrl: './name-entry-dialog.component.html',
  styleUrls: ['./name-entry-dialog.component.scss'],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatButtonModule,
    DialogBodyComponent,
    DialogFooterComponent,
    DialogHeaderComponent,
  ],
})
export class NameEntryDialogComponent {
  dialogRef = inject<MatDialogRef<NameEntryDialogComponent>>(MatDialogRef);
  i18n = inject(I18NService);

  nameControl = new FormControl('', [Validators.required, Validators.maxLength(40)]);

  cancel(): void {
    this.dialogRef.close(null);
  }

  submit(event?: Event): void {
    event?.preventDefault();
    if (this.nameControl.valid && this.nameControl.value?.trim()) {
      this.dialogRef.close(this.nameControl.value.trim());
    }
  }
}
