import { Component, effect, inject, input, output } from '@angular/core';
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
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './journal-form.component.html',
  styleUrl: './journal-form.component.scss',
})
export class JournalFormComponent {
  i18n = inject(I18NService);
  journal = inject(JournalService);
  @ViewChild('formDirective') private formDirective!: FormGroupDirective;

  JournalEntryStatus = JournalEntryStatus;
  DepartmentValues = DepartmentValues;
  CommunicationTypeValues = CommunicationTypeValues;

  entry = input.required<JournalEntry | null>();
  close = output();
  selectedIndex = 0;

  constructor() {
    effect(() => {
      this.selectEntry(this.entry());
    });
  }

  journalForm = new FormGroup({
    messageNumber: new FormControl<string | number>('', {
      nonNullable: true,
      validators: [this.requiredField('messageNumber')],
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
        return control.value ? null : { requiredStep: true };
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

    this.formDirective.resetForm();
    this.journalForm.patchValue({
      ...entry,
      dateCreatedDate: entry.dateMessage,
      dateCreatedTime: entry.dateMessage,
    });
  }

  addNew() {
    this.selectedIndex = 0;
    this.formDirective.resetForm();
    this.journalForm.reset();
  }

  isTabDisabled(tabStatus: JournalEntryStatus): boolean {
    const order = Object.values(JournalEntryStatus);
    return order.indexOf(this.journalForm.controls.entryStatus.value) < order.indexOf(tabStatus);
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
      requiredField.setErrors({ required: true });
      requiredField.markAsTouched();
      return;
    }

    const { error, result } = await this.journal.update(
      {
        entryStatus,
        [required]: requiredField.value,
      },
      this.entry()?.documentId,
    );
    if (error || !result) {
      console.error(`could not update state of journalEntry ${this.entry()?.documentId}`, error);
      return;
    }

    this.journal.reload();
    await this.selectEntry(await this.journal.get(result.documentId!));
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

    if (this.journalForm.invalid || this.journalForm.pending) {
      this.journalForm.markAllAsTouched();
      return;
    }

    let allowedFields = JournalEntryStatusFields[entryStatus];
    const newEntryStatus = JournalEntryStatusNext[entryStatus];
    const reset = JournalEntryStatusReset[newEntryStatus];

    //prepare object with only allowed/changed fields to save
    const { dateCreatedTime, dateCreatedDate, ...rest } = this.journalForm.value;
    const values: Partial<JournalEntry> = {
      ...(rest as JournalEntry),
      dateMessage: this.combineDateAndTime(dateCreatedDate!, dateCreatedTime!),
    };
    if (reset && values[reset.required]) {
      values[reset.required] = null as any;
      allowedFields = [...allowedFields, reset.required];
    }

    const { result, error } = await this.journal.save({
      ...this.filterObject(values, allowedFields),
      entryStatus: newEntryStatus,
      documentId: this.entry()?.documentId,
    } as JournalEntry);

    if (error || !result) {
      console.error('Error saving journal entry', error);
      return;
    }
    this.journal.reload();
    await this.selectEntry(await this.journal.get(result.documentId!));
  }
}
