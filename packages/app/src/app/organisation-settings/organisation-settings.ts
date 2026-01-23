import { Component, inject } from '@angular/core';
import { MatDialogClose, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { I18NService } from '../state/i18n.service';
import { IZsMapOrganizationSettings } from '@zskarte/types';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { SessionService } from '../session/session.service';
import { DialogBodyComponent, DialogFooterComponent, DialogHeaderComponent } from '../ui/dialog-layout';
import { MatCard } from "@angular/material/card";

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
    DialogHeaderComponent,
    DialogBodyComponent,
    DialogFooterComponent,
    MatCard
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
