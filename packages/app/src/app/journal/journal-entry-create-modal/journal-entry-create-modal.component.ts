import { Component, inject, signal, viewChild, afterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { I18NService } from '../../state/i18n.service';
import { JournalFormComponent } from '../journal-form/journal-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JournalService } from '../journal.service';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';

@Component({
  selector: 'app-journal-entry-create-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    JournalFormComponent,
  ],
  templateUrl: './journal-entry-create-modal.component.html',
  styleUrl: './journal-entry-create-modal.component.scss',
})
export class JournalEntryCreateModalComponent implements afterViewInit {
  dialogRef = inject<MatDialogRef<JournalEntryCreateModalComponent>>(MatDialogRef);
  private _dialog = inject(MatDialog);
  i18n = inject(I18NService);
  journal = inject(JournalService);
  private _snackBar = inject(MatSnackBar);
  private _destroyRef = inject(DestroyRef);
  journalFormComponent = viewChild.required(JournalFormComponent);
  isDirty = signal(false);

  constructor() {
    this.dialogRef.backdropClick().pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
      this.handleCloseAttempt();
    });

    this.dialogRef.keydownEvents().pipe(takeUntilDestroyed(this._destroyRef)).subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        this.handleCloseAttempt();
      }
    });
  }

  ngAfterViewInit() {
    // Initialize the form for creating a new entry
    const formComponent = this.journalFormComponent();
    if (formComponent) {
      formComponent.addNew();
      
      // Subscribe to saved events from the form
      formComponent.saved.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((messageNumber) => {
        this.showSuccessSnackbar(messageNumber);
      });
    }
  }

  onDirty(dirty: boolean) {
    this.isDirty.set(dirty);
  }

  handleCloseAttempt() {
    if (this.isDirty()) {
      const confirmDialog = this._dialog.open(ConfirmationDialogComponent, {
        data: {
          message: this.i18n.get('discardEntryConfirm'),
          cancelLabel: this.i18n.get('continueEditing'),
          confirmLabel: this.i18n.get('discardEntry'),
        },
        width: '400px',
      });
      confirmDialog.afterClosed().subscribe((response) => {
        if (response === true) {
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

  showSuccessSnackbar(messageNumber: number) {
    this._snackBar.open(
      this.i18n.get('entryCreated').replace('{number}', messageNumber.toString()),
      undefined,
      { duration: 3000 },
    );
  }
}
