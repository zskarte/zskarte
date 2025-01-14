import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { I18NService } from '../state/i18n.service';
import { OperationExportFile } from '../core/entity/operationExportFile';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.scss'],
  imports: [MatButtonModule],
})
export class ImportDialogComponent {
  dialogRef = inject<MatDialogRef<ImportDialogComponent, OperationExportFile | null>>(MatDialogRef);
  i18n = inject(I18NService);

  readonly el = viewChild.required<ElementRef>('fileInput');

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  readFromFile() {
    const reader = new FileReader();
    for (const file of this.el().nativeElement.files) {
      reader.onload = () => {
        // this 'text' is the content of the file
        const text = reader.result as string;
        if (text) {
          this.dialogRef.close(JSON.parse(text));
        }
      };
      reader.readAsText(file, 'UTF-8');
    }
  }
}
