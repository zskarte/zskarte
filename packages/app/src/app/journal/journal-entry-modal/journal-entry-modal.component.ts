import { Component, inject, signal, viewChild, AfterViewInit, DestroyRef } from '@angular/core';
import { MatDialogModule, MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { I18NService } from '../../state/i18n.service';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { JournalFormComponent } from '../journal-form/journal-form.component';
import { JournalEntry } from '../journal.types';

@Component({
  selector: 'app-journal-entry-modal',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatButtonModule, JournalFormComponent],
  templateUrl: './journal-entry-modal.component.html',
})
export class JournalEntryModalComponent implements AfterViewInit {
  private dialogRef = inject<MatDialogRef<JournalEntryModalComponent>>(MatDialogRef);
  private _dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _destroyRef = inject(DestroyRef);
  i18n = inject(I18NService);
  journalFormComponent = viewChild.required(JournalFormComponent);
  isDirty = signal(false);
  entryToEdit: JournalEntry | null = inject(MAT_DIALOG_DATA, { optional: true }) || null;

  constructor() {
    this.dialogRef.disableClose = true;
    this.dialogRef.backdropClick().pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => this.handleCloseAttempt());
    this.dialogRef.keydownEvents().pipe(takeUntilDestroyed(this._destroyRef)).subscribe((event) => {
      if (event.key === 'Escape') {
        this.handleCloseAttempt();
      }
    });
  }

  ngAfterViewInit() {
    const formComponent = this.journalFormComponent();
    formComponent.close.subscribe(() => {
      this.dialogRef.close();
    });
  }

  onDirty(dirty: boolean) {
    this.isDirty.set(dirty);
  }

  handleCloseAttempt() {
    if (this.isDirty()) {
      this._dialog.open(ConfirmationDialogComponent, {
        data: this.i18n.get('discardEntryConfirm'),
      }).afterClosed().subscribe((confirmed) => {
        if (confirmed) {
          this.dialogRef.close();
        }
      });
    } else {
      this.dialogRef.close();
    }
  }

  onClose() {
    this.handleCloseAttempt();
  }

  onSave() {
    this.journalFormComponent().save();
  }
}
