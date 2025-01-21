import {Component, inject} from '@angular/core';
import {I18NService} from "../state/i18n.service";
import {MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-journal-create-dialog',
  imports: [MatFormFieldModule, FormsModule, MatDialogModule],
  templateUrl: './journal-create-dialog.component.html',
  styleUrl: './journal-create-dialog.component.scss'
})
export class JournalCreateDialogComponent {
  dialogRef = inject<MatDialogRef<JournalCreateDialogComponent, null>>(MatDialogRef);
  i18n = inject(I18NService);

  public text: string = '';

  submit() {
    alert(0);
  }

  cancel() {
    this.dialogRef.close();
  }

}
