import { Component, HostListener, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { I18NService } from '../../state/i18n.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  Department,
  DepartmentValues,
  JournalEntry,
  JournalEntryStatus,
  JournalEntryStatusDateField,
  JournalEntryStatusNext,
  JournalEntryStatusFields,
  JournalEntryStatusReset,
  CommunicationTypeValues,
  CommunicationType,
} from '../journal.types';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { ViewChild } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { JournalService } from '../journal.service';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from 'src/app/info-dialog/info-dialog.component';
import { ConfirmationDialogComponent } from 'src/app/confirmation-dialog/confirmation-dialog.component';
import { ZsMapStateService } from 'src/app/state/state.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TextAreaWithAddressSearchComponent } from '../text-area-with-address-search/text-area-with-address-search.component';
import { SearchService } from 'src/app/search/search.service';
import { ReplaceAllAddressTokensPipe } from '../../search/replace-all-address-tokens.pipe';

@Component({
  selector: 'app-journal-form',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatCheckboxModule,
    MatTabsModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    CommonModule,
    TextAreaWithAddressSearchComponent,
    ReplaceAllAddressTokensPipe,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './journal-form.component.html',
  styleUrl: './journal-form.component.scss',
})
export class JournalFormComponent {
  private _dialog = inject(MatDialog);
  private _state = inject(ZsMapStateService);
  i18n = inject(I18NService);
  journal = inject(JournalService);
  search = inject(SearchService);
  readonly formVisible = signal(false);
  readonly isReadOnly = toSignal(this._state.observeIsReadOnly());
  @ViewChild('formDirective') private formDirective!: FormGroupDirective;
  messageContentEl = viewChild<TextAreaWithAddressSearchComponent>('messageContent');

  JournalEntryStatus = JournalEntryStatus;
  DepartmentValues = DepartmentValues;
  CommunicationTypeValues = CommunicationTypeValues;

  entry = input.required<JournalEntry | null>();
  dirty = output<boolean>();
  close = output();
  selectedIndex = 0;
  showPrint = false;
  markPotentialAddresses = signal(false);
  constructor() {
    effect(() => {
      this.selectEntry(this.entry());
    });

    this.journalForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.dirty.emit(this.journalForm.dirty);
    });
  }

  journalForm = new FormGroup({
    messageNumber: new FormControl<string | number>('', {
      nonNullable: true,
    }),
    sender: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredField('sender')],
    }),
    creator: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredField('creator')],
    }),
    communicationType: new FormControl<CommunicationType>(null, {
      nonNullable: true,
      validators: [this.requiredField('communicationType')],
    }),
    communicationDetails: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredField('communicationDetails')],
    }),
    messageSubject: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredField('messageSubject')],
    }),
    messageContent: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredField('messageContent')],
    }),
    visumMessage: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredField('visumMessage')],
    }),
    dateCreatedDate: new FormControl<Date>(new Date(), {
      nonNullable: true,
      validators: [this.requiredField('dateMessage')],
    }),
    dateCreatedTime: new FormControl<Date>(new Date(), {
      nonNullable: true,
      validators: [this.requiredField('dateMessage')],
    }),
    wrongContentInfo: new FormControl<string>('', {
      nonNullable: true,
      validators: [this.requiredField('wrongContentInfo')],
    }),
    department: new FormControl<Department>(null, {
      nonNullable: true,
      validators: [this.requiredField('department')],
    }),
    isKeyMessage: new FormControl(false, { nonNullable: true }),
    visumTriage: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredField('visumTriage')],
    }),
    dateTriage: new FormControl<Date | null>(null, {
      validators: [this.requiredField('dateTriage')],
    }),
    wrongTriageInfo: new FormControl<string>('', {
      nonNullable: true,
      validators: [this.requiredField('wrongTriageInfo')],
    }),
    dateDecision: new FormControl<Date | null>(null, {
      validators: [this.requiredField('dateDecision')],
    }),
    visumDecider: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredField('visumDecider')],
    }),
    decision: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredField('decision')],
    }),
    decisionReceiver: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredField('decisionReceiver')],
    }),
    entryStatus: new FormControl<JournalEntryStatus>(JournalEntryStatus.AWAITING_MESSAGE, { nonNullable: true }),
    dateDecisionDelivered: new FormControl<Date | null>(null, {
      validators: [this.requiredField('dateDecisionDelivered')],
    }),
    decisionSender: new FormControl('', {
      nonNullable: true,
      validators: [this.requiredField('decisionSender')],
    }),
  });

  get messageContentControl(): FormControl {
    return this.journalForm.get('messageContent') as FormControl;
  }

  private combineDateAndTime(dateObj: Date, timeObj: Date) {
    const newDate = new Date(dateObj);
    newDate.setHours(timeObj.getHours());
    newDate.setMinutes(timeObj.getMinutes());
    newDate.setSeconds(timeObj.getSeconds());
    newDate.setMilliseconds(timeObj.getMilliseconds());
    return newDate;
  }

  private requiredField(fieldName: keyof JournalEntry): ValidatorFn {
    return (control: AbstractControl) => {
      if (this.journalForm === undefined) return null;

      const entryStatus = this.journalForm.controls.entryStatus.value;
      if (JournalEntryStatusFields[entryStatus].includes(fieldName)) {
        return control.value ? null : { requiredField: true };
      }
      return null;
    };
  }

  async selectEntry(entry: JournalEntry | null) {
    if (!entry) {
      return;
    }
    // biome-ignore format: next-line
    this.selectedIndex =
      entry.entryStatus === JournalEntryStatus.AWAITING_MESSAGE ? 0
      : entry.entryStatus === JournalEntryStatus.AWAITING_TRIAGE ? 1
      : entry.entryStatus === JournalEntryStatus.AWAITING_DECISION ? 2
      : 3;

    this.journalForm.reset();
    this.formDirective.resetForm();
    this.journalForm.patchValue({
      ...entry,
      dateCreatedDate: entry.dateMessage,
      dateCreatedTime: entry.dateMessage,
    });
    this.showPrint = false;
    this.formVisible.set(true);
  }

  addNew() {
    this.selectedIndex = 0;
    this.journalForm.reset();
    this.formDirective.resetForm();
    this.journalForm.patchValue({
      dateCreatedDate: new Date(),
      dateCreatedTime: new Date(),
    });
    this.showPrint = false;
    this.formVisible.set(true);
  }

  isTabDisabled(tabStatus: JournalEntryStatus): boolean {
    const order = Object.values(JournalEntryStatus);
    return order.indexOf(this.journalForm.controls.entryStatus.value) < order.indexOf(tabStatus);
  }

  onEnterForResetState(event: Event) {
    event.preventDefault();
    this.resetState();
  }

  async resetState() {
    const reset = JournalEntryStatusReset[this.journalForm.controls.entryStatus.value];
    if (!reset) {
      return;
    }
    const { entryStatus, required } = reset;
    const requiredField = this.journalForm.get(required);
    if (!requiredField) {
      return;
    }
    if (!requiredField.value) {
      Object.values(this.journalForm.controls).forEach((control) => {
        control.setErrors(null);
      });
      requiredField.setErrors({ required: true });
      requiredField.markAsTouched();
      InfoDialogComponent.showErrorDialog(this._dialog, this.i18n.get('fillAllFields'));
      return;
    }

    const { error, result } = await this.journal.update(
      {
        entryStatus,
        [required]: requiredField.value,
      },
      this.entry()?.documentId,
      this.entry()?.uuid,
    );
    if (error || !result) {
      console.error(`could not update state of journalEntry ${this.entry()?.documentId}`, error);
      InfoDialogComponent.showSaveErrorDialog(this._dialog, this.i18n, error);
      if (!(typeof error === 'object' && 'localOnly' in error && error.localOnly)) {
        return;
      }
    }

    this.doClose();
  }

  filterObject<T>(obj: Partial<T>, allowedKeys: (keyof T)[]): Partial<T> {
    const filteredObj: Partial<T> = {};
    for (const key of allowedKeys) {
      if (key in obj) {
        filteredObj[key] = obj[key];
      }
    }
    return filteredObj;
  }

  async save() {
    const entryStatus = this.journalForm.controls.entryStatus.value;
    const dateField = JournalEntryStatusDateField[entryStatus];
    if (dateField) {
      this.journalForm.patchValue({ [dateField]: new Date() });
    }

    //active verify all required fields
    let allowedFields = JournalEntryStatusFields[entryStatus];
    Object.entries(this.journalForm.controls).forEach(([fieldName, control]) => {
      if (allowedFields.includes(fieldName as keyof JournalEntry)) {
        control.updateValueAndValidity();
      }
    });
    //unrequire reset field
    const currentReset = JournalEntryStatusReset[entryStatus];
    if (currentReset) {
      this.journalForm.controls[currentReset.required].markAsUntouched();
      this.journalForm.controls[currentReset.required].setErrors(null);
    }

    if (this.journalForm.invalid || this.journalForm.pending) {
      this.journalForm.markAllAsTouched();
      InfoDialogComponent.showErrorDialog(this._dialog, this.i18n.get('fillAllFields'));
      return;
    }
    let newEntryStatus = JournalEntryStatusNext[entryStatus];
    const nextReset = JournalEntryStatusReset[newEntryStatus];

    if (
      entryStatus === JournalEntryStatus.AWAITING_TRIAGE &&
      this.journalForm.controls.department.value === 'lagedarstellung' &&
      this.entry()?.isDrawnOnMap
    ) {
      //if department is set to 'lagedarstellung' only drawn on map is required, if that is already done on time of triage, set it directly to complete.
      newEntryStatus = JournalEntryStatus.COMPLETED;
    }

    //prepare object with only allowed/changed fields to save
    const { dateCreatedTime, dateCreatedDate, ...rest } = this.journalForm.value;
    const values: Partial<JournalEntry> = {
      ...(rest as JournalEntry),
      ...(dateCreatedDate && dateCreatedTime
        ? { dateMessage: this.combineDateAndTime(dateCreatedDate, dateCreatedTime) }
        : {}),
    };
    if (nextReset && values[nextReset.required]) {
      //clear reset field of next step, so it's not longer filled
      values[nextReset.required] = null as any;
      allowedFields = [...allowedFields, nextReset.required];
    }

    const { result, error } = await this.journal.save({
      ...this.filterObject(values, allowedFields),
      entryStatus: newEntryStatus,
      documentId: this.entry()?.documentId,
      uuid: this.entry()?.uuid,
    } as JournalEntry);

    if (error || !result) {
      console.error('Error saving journal entry', error);
      InfoDialogComponent.showSaveErrorDialog(this._dialog, this.i18n, error);
      if (!(typeof error === 'object' && 'localOnly' in error && error.localOnly)) {
        this.showPrint = true;
        return;
      }
    }

    if (this.entry() === null) {
      //if in message creating "mode" directly start to add new one, and keep obvious values
      this.addNew();
      this.journalForm.patchValue({
        visumMessage: rest.visumMessage,
      });
      if (rest.communicationType === 'funk') {
        this.journalForm.patchValue({
          communicationType: rest.communicationType,
          communicationDetails: rest.communicationDetails,
        });
      }
      this.dirty.emit(false);
      this.showPrint = false;
    } else {
      this.doClose();
    }
  }

  @HostListener('window:keydown.Escape', ['$event'])
  closeSidebareOnEsc(event: KeyboardEvent): void {
    const messageContentEl = this.messageContentEl();
    if (messageContentEl) {
      if (messageContentEl.abortOnEsc(event)) {
        return;
      }
    } else if (this.search.handleEsc(event)) {
      return;
    }

    if (this._dialog.openDialogs.length === 0) {
      event.preventDefault();
      event.stopPropagation();
      this.closeForm();
    }
  }

  closeForm() {
    if (this.journalForm.dirty) {
      const confirm = this._dialog.open(ConfirmationDialogComponent, {
        data: this.i18n.get('closeNotSaved'),
      });
      confirm.afterClosed().subscribe((response) => {
        if (response) {
          this.doClose();
        }
      });
    } else {
      this.doClose();
    }
  }

  doClose() {
    this.formVisible.set(false);
    this.search.addressPreview.set(false);
    this.dirty.emit(false);
    this.close.emit();
  }

  async print(event: Event) {
    event.stopPropagation();
    const button = (event.target as HTMLElement).closest('button');
    if (button) {
      button.disabled = true;
    }
    //prepare object
    const { dateCreatedTime, dateCreatedDate, ...rest } = this.journalForm.value;
    const entry: JournalEntry = {
      ...(rest as JournalEntry),
      ...(dateCreatedDate && dateCreatedTime
        ? { dateMessage: this.combineDateAndTime(dateCreatedDate, dateCreatedTime) }
        : {}),
      documentId: this.entry()?.documentId,
    };

    await this.journal.print({
      ...entry,
      messageContent: this.search.removeAllAddressTokens(entry.messageContent, false),
    });

    setTimeout(() => {
      if (button) {
        button.disabled = false;
      }
    }, 1000);
  }

  async showAllAddresses() {
    await this.search.showAllFeature(this.messageContentControl.value, true);
    this.search.addressPreview.set(true);
  }
}
