import { Component, inject, signal, viewChild, AfterViewInit, DestroyRef } from '@angular/core';
import { MatDialogModule, MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { I18NService } from '../../state/i18n.service';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { JournalFormComponent } from '../journal-form/journal-form.component';
import { DialogHeaderComponent, DialogBodyComponent, DialogFooterComponent } from '../../ui/dialog-layout';
import { JournalEntry } from '../journal.types';

@Component({
  selector: 'app-journal-entry-create-modal',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatButtonModule, JournalFormComponent, DialogHeaderComponent, DialogBodyComponent, DialogFooterComponent],
  templateUrl: './journal-entry-create-modal.component.html',
})
export class JournalEntryCreateModalComponent implements AfterViewInit {
  private dialogRef = inject<MatDialogRef<JournalEntryCreateModalComponent>>(MatDialogRef);
  private _dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _destroyRef = inject(DestroyRef);
  private _data = inject<{ entry?: JournalEntry }>(MAT_DIALOG_DATA, { optional: true });
  i18n = inject(I18NService);
  journalFormComponent = viewChild.required(JournalFormComponent);
  isDirty = signal(false);
  entry = signal<JournalEntry | null>(this._data?.entry ?? null);
  isEditMode = signal(!!this._data?.entry);

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
    formComponent.saved.subscribe((messageNumber) => {
      if (this.isEditMode()) {
        this.dialogRef.close();
      } else {
        this.showSuccessSnackbar(messageNumber);
      }
    });
  }

  onDirty(dirty: boolean) {
    this.isDirty.set(dirty);
  }

  handleCloseAttempt() {
    if (this.isDirty()) {
      this._dialog.open(ConfirmationDialogComponent, {
        data: {
          message: this.i18n.get('discardEntryConfirm'),
          cancelLabel: this.i18n.get('continueEditingAction'),
          confirmLabel: this.i18n.get('discardEntry'),
        },
        width: '520px',
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

  private showSuccessSnackbar(messageNumber: number) {
    this._snackBar.open(this.i18n.get('entryCreated').replace('{number}', messageNumber.toString()), undefined, { duration: 3000 });
  }

  getTitle(): string {
    if (this.isEditMode() && this.entry()) {
      return `${this.i18n.get('edit')} ${this.i18n.get('journalEntry_awaiting_message')} #${this.entry()!.messageNumber}`;
    }
    return this.i18n.get('createNewEntry');
  }
}
