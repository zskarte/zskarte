import {Component, inject} from '@angular/core';
import {I18NService} from "../state/i18n.service";
import {MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule} from "@angular/forms";
import {ApiService} from "../api/api.service";

@Component({
  selector: 'app-journal-create-dialog',
  imports: [MatFormFieldModule, FormsModule, MatDialogModule],
  templateUrl: './journal-create-dialog.component.html',
  styleUrl: './journal-create-dialog.component.scss'
})
export class JournalCreateDialogComponent {
  dialogRef = inject<MatDialogRef<JournalCreateDialogComponent, null>>(MatDialogRef);
  i18n = inject(I18NService);
  private apiService = inject(ApiService);

  public text: string = '';
  public subject: string = '';
  public messageNumber: number = 0;

  async submit() {
    const entry = {
      data: {
        message_content: this.text,
        message_subject: this.subject,
        message_number: this.messageNumber
      }
    };

    await this.apiService.post('/api/journal-entries', entry);
    this.dialogRef.close();
  }

  cancel() {
    this.dialogRef.close();
  }

}
