import { Component, effect, inject, input, OnDestroy, resource, signal, ViewChild } from '@angular/core';
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
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
} from '@angular/forms';
import {
  CommunicationType,
  CommunicationTypeValues,
  Department,
  DepartmentValues,
  JournalEntry,
  JournalEntryStatus,
  JournalEntryStatusDateField,
  JournalEntryStatusFields,
  JournalEntryStatusNext,
  JournalEntryStatusReset,
} from '../journal.types';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { JournalService } from '../journal.service';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from 'src/app/info-dialog/info-dialog.component';
import { ZsMapStateService } from 'src/app/state/state.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TextAreaWithAddressSearchComponent } from '../text-area-with-address-search/text-area-with-address-search.component';
import { SearchService } from 'src/app/search/search.service';
import { ReplaceAllAddressTokensPipe } from '../../search/replace-all-address-tokens.pipe';
import { SidebarService } from '../../sidebar/sidebar.service';

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
export class JournalFormComponent implements OnDestroy {
  private _dialog = inject(MatDialog);
  private _state = inject(ZsMapStateService);
  private _sidebar = inject(SidebarService);
  i18n = inject(I18NService);
  journal = inject(JournalService);
  search = inject(SearchService);
  readonly formVisible = signal(false);
  readonly isReadOnly = toSignal(this._state.observeIsReadOnly());
  @ViewChild('formDirective') private formDirective!: FormGroupDirective;

  JournalEntryStatus = JournalEntryStatus;
  DepartmentValues = DepartmentValues;
  CommunicationTypeValues = CommunicationTypeValues;

  currentMessage = input.required<number | null>();
  selectedIndex = 0;
  showPrint = false;
  markPotentialAddresses = signal(false);
  manualMessageNumber = signal(false);

  entry = resource({
    params: this.currentMessage,
    loader: ({ params }) => {
      if (params) {
        return this.journal.getByNumber(params);
      }
      return Promise.resolve(undefined);
    },
  });

  constructor() {
    effect(() => {
      void this.selectEntry(this.entry.value() ?? null);
    });

    this.journalForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this._sidebar.formDirty.set(this.journalForm.dirty);
    });
  }

  journalForm = new FormGroup({
    messageNumber: new FormControl<string | number>(
      { value: '', disabled: true },
      {
        nonNullable: true,
      },
    ),
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

  normalizeTimeInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (!input) {
      return;
    }
    const digits = input.value.replace(/\D/g, '');
    if (digits.length !== 4) {
      return;
    }
    const hours = Number(digits.slice(0, 2));
    const minutes = Number(digits.slice(2, 4));
    if (Number.isNaN(hours) || Number.isNaN(minutes) || hours > 23 || minutes > 59) {
      return;
    }
    const base = this.journalForm.controls.dateCreatedTime.value ?? new Date();
    const normalized = new Date(base);
    normalized.setHours(hours, minutes, 0, 0);
    this.journalForm.controls.dateCreatedTime.setValue(normalized);
    input.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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
    this.manualMessageNumber.set(false);
    this.journalForm.patchValue({
      ...entry,
      dateCreatedDate: entry.dateMessage,
      dateCreatedTime: entry.dateMessage,
    });
    // Keep messageNumber disabled when editing existing entry
    if (entry.messageNumber) {
      this.journalForm.controls.messageNumber.disable();
    }
    this.showPrint = false;
    this.formVisible.set(true);
  }

  addNew() {
    this.selectedIndex = 0;
    this.journalForm.reset();
    this.formDirective.resetForm();
    this.manualMessageNumber.set(false);
    this.journalForm.controls.messageNumber.disable();
    this.journalForm.patchValue({
      dateCreatedDate: new Date(),
      dateCreatedTime: new Date(),
    });
    this.showPrint = false;
    this.formVisible.set(true);
  }

  toggleManualMessageNumber(event: boolean) {
    this.manualMessageNumber.set(event);
    if (event) {
      this.journalForm.controls.messageNumber.enable();
      this.journalForm.controls.messageNumber.updateValueAndValidity();
    } else {
      this.journalForm.controls.messageNumber.disable();
      this.journalForm.controls.messageNumber.setValue('');
      this.journalForm.controls.messageNumber.setErrors(null);
    }
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
      this.entry.value()?.documentId,
      this.entry.value()?.uuid,
    );
    if (error || !result) {
      console.error(`could not update state of journalEntry ${this.entry.value()?.documentId}`, error);
      InfoDialogComponent.showSaveErrorDialog(this._dialog, this.i18n, error);
      if (!(typeof error === 'object' && 'localOnly' in error && error.localOnly)) {
        return;
      }
    }
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
    const currentReset = JournalEntryStatusReset[entryStatus];
    if (currentReset) {
      this.journalForm.controls[currentReset.required].markAsUntouched();
      this.journalForm.controls[currentReset.required].setErrors(null);
    }

    if (this.manualMessageNumber() && this.journalForm.controls.messageNumber.value) {
      const messageNumber =
        typeof this.journalForm.controls.messageNumber.value === 'string' ?
          parseInt(this.journalForm.controls.messageNumber.value, 10)
        : this.journalForm.controls.messageNumber.value;

      if (!isNaN(messageNumber) && messageNumber > 0) {
        const currentEntry = this.entry.value();
        const exists = await this.journal.messageNumberAlreadyExist(
          messageNumber,
          currentEntry?.uuid || currentEntry?.documentId,
        );

        if (exists) {
          this.journalForm.controls.messageNumber.setErrors({ messageNumberExists: true });
          this.journalForm.controls.messageNumber.markAsTouched();
          InfoDialogComponent.showErrorDialog(
            this._dialog,
            this.i18n.get('messageNumberAlreadyExists').replace('{number}', messageNumber.toString()),
          );
          return;
        }
      }
    }

    if (this.journalForm.invalid || this.journalForm.pending) {
      this.journalForm.markAllAsTouched();
      InfoDialogComponent.showErrorDialog(this._dialog, this.i18n.get('fillAllFields'));
      return;
    }
    const newEntryStatus = JournalEntryStatusNext[entryStatus];
    const nextReset = JournalEntryStatusReset[newEntryStatus];

    //prepare object with only allowed/changed fields to save
    // Use getRawValue() to include disabled controls (like messageNumber when manually entered)
    const formRawValue = this.journalForm.getRawValue();
    const { dateCreatedTime, dateCreatedDate, messageNumber, ...rest } = formRawValue;
    const values: Partial<JournalEntry> = {
      ...(rest as JournalEntry),
      ...(dateCreatedDate && dateCreatedTime ?
        { dateMessage: this.combineDateAndTime(dateCreatedDate, dateCreatedTime) }
      : {}),
      // Only include messageNumber if manually entered
      ...(this.manualMessageNumber() && messageNumber ?
        { messageNumber: typeof messageNumber === 'string' ? parseInt(messageNumber, 10) : messageNumber }
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
      documentId: this.entry.value()?.documentId,
      uuid: this.entry.value()?.uuid,
    } as JournalEntry);

    if (error || !result) {
      console.error('Error saving journal entry', error);
      InfoDialogComponent.showSaveErrorDialog(this._dialog, this.i18n, error);
      if (!(typeof error === 'object' && 'localOnly' in error && error.localOnly)) {
        this.showPrint = true;
        return;
      }
    }

    if (!this.entry.value()) {
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
      this._sidebar.formDirty.set(false);
      this.showPrint = false;
    } else {
      void this._sidebar.close();
    }
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
      ...(dateCreatedDate && dateCreatedTime ?
        { dateMessage: this.combineDateAndTime(dateCreatedDate, dateCreatedTime) }
      : {}),
      documentId: this.entry.value()?.documentId,
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

  ngOnDestroy() {
    this._sidebar.formDirty.set(false);
  }
}
