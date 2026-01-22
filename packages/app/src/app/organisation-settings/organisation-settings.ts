import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { I18NService } from '../state/i18n.service';
import { IZsMapOrganizationSettings } from '@zskarte/types';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { SessionService } from '../session/session.service';

@Component({
  selector: 'app-organisation-settings',
  templateUrl: './organisation-settings.html',
  styleUrl: './organisation-settings.scss',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatDialogClose,
    MatButtonModule,
  ],
})
export class OrganisationSettings {
  private dialogRef = inject<MatDialogRef<OrganisationSettings>>(MatDialogRef);
  private _session = inject(SessionService);
  i18n = inject(I18NService);
  settings: IZsMapOrganizationSettings;

  constructor() {
    this.settings = { ...this._session.getOrganizationSettings() };
  }

  async ok() {
    await this._session.saveOrganizationSettings(this.settings);
    this.dialogRef.close({ settings: this.settings });
  }
}
