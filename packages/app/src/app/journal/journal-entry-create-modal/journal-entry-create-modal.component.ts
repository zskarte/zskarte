import { Component, inject, signal, viewChild, AfterViewInit, DestroyRef } from '@angular/core';
import { MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { I18NService } from '../../state/i18n.service';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { JournalFormComponent } from '../journal-form/journal-form.component';
import { DialogHeaderComponent, DialogBodyComponent, DialogFooterComponent } from '../../dialog-layout';

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
  i18n = inject(I18NService);
  journalFormComponent = viewChild.required(JournalFormComponent);
  isDirty = signal(false);

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
    formComponent.addNew();
    formComponent.saved.subscribe((messageNumber) => this.showSuccessSnackbar(messageNumber));
    
    this.dialogRef.afterOpened().subscribe(() => {
      setTimeout(() => {
        formComponent.focusSenderInput();
      }, 100);
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
}
