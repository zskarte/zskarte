import { Component } from '@angular/core';
import { I18NService } from '../i18n.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-tag-state',
  templateUrl: './tag-state.component.html',
  styleUrls: ['./tag-state.component.css'],
})
export class TagStateComponent {
  constructor(
    public dialogRef: MatDialogRef<TagStateComponent>,
    public i18n: I18NService
  ) {}

  tag: string;

  cancel(): void {
    this.dialogRef.close(null);
  }

  submit(): void {
    this.dialogRef.close(this.tag);
  }
}
