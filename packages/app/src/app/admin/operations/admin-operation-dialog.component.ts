import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I18NService } from '../../state/i18n.service';
import { trpc } from '../../api/trpc.client';
import { trpcRequest } from '../../api/trpc.error';
import { DialogBodyComponent, DialogFooterComponent, DialogHeaderComponent } from '../../ui/dialog-layout';
import type { AdminOrganizationData } from '../organizations/admin-organization-dialog.component';

export interface AdminOperationData {
  documentId: string;
  name: string;
  description?: string | null;
  phase: 'active' | 'archived' | 'deleted';
  organizationId: string;
  organizationName?: string | null;
  eventStates?: number[] | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface AdminOperationDialogData {
  mode: 'create' | 'edit';
  operation?: AdminOperationData;
  organizations: AdminOrganizationData[];
  selectedOrganizationId?: string;
}

@Component({
  selector: 'app-admin-operation-dialog',
  templateUrl: './admin-operation-dialog.component.html',
  styleUrls: ['./admin-operation-dialog.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DialogHeaderComponent,
    DialogBodyComponent,
    DialogFooterComponent,
  ],
})
export class AdminOperationDialogComponent {
  public i18n = inject(I18NService);
  public data: AdminOperationDialogData = inject(MAT_DIALOG_DATA) || {
    mode: 'create',
    organizations: [],
  };
  public isSaving = signal(false);
  public phases: Array<{ value: 'active' | 'archived' | 'deleted'; label: string }> = [
    { value: 'active', label: this.i18n.get('active') },
    { value: 'archived', label: this.i18n.get('archived') },
    { value: 'deleted', label: this.i18n.get('deleted') },
  ];
  private fb = inject(FormBuilder);
  public form = this.fb.group({
    name: [this.data.operation?.name ?? '', [Validators.required, Validators.minLength(1)]],
    organizationId: [
      this.data.operation?.organizationId ??
        this.data.selectedOrganizationId ??
        this.data.organizations[0]?.documentId ??
        '',
      [Validators.required],
    ],
    description: [this.data.operation?.description ?? ''],
    phase: [this.data.operation?.phase ?? 'active', [Validators.required]],
  });
  private dialogRef = inject<MatDialogRef<AdminOperationDialogComponent>>(MatDialogRef);
  private snackBar = inject(MatSnackBar);

  public async save(): Promise<void> {
    if (this.form.invalid || this.isSaving()) return;

    this.isSaving.set(true);
    try {
      const formVal = this.form.value;

      if (this.data.mode === 'create') {
        const createRes = await trpcRequest(
          trpc.admin.operation.create.mutate({
            name: formVal.name!.trim(),
            organizationId: formVal.organizationId!,
            description: formVal.description?.trim() || null,
            phase: formVal.phase as 'active' | 'archived' | 'deleted',
          }),
        );

        if (createRes.error) {
          this.snackBar.open(this.i18n.get('error'), 'OK', { duration: 3000 });
        } else {
          this.snackBar.open(this.i18n.get('operationCreated'), 'OK', { duration: 3000 });
          this.dialogRef.close({ saved: true, result: createRes.result });
        }
      } else {
        const opId = this.data.operation!.documentId;
        const updateRes = await trpcRequest(
          trpc.admin.operation.update.mutate({
            documentId: opId,
            data: {
              name: formVal.name!.trim(),
              organizationId: formVal.organizationId!,
              description: formVal.description?.trim() || null,
              phase: formVal.phase as 'active' | 'archived' | 'deleted',
            },
          }),
        );

        if (updateRes.error) {
          this.snackBar.open(this.i18n.get('error'), 'OK', { duration: 3000 });
        } else {
          this.snackBar.open(this.i18n.get('operationUpdated'), 'OK', { duration: 3000 });
          this.dialogRef.close({ saved: true, result: updateRes.result });
        }
      }
    } catch (e) {
      console.error(e);
      this.snackBar.open(this.i18n.get('error'), 'OK', { duration: 3000 });
    } finally {
      this.isSaving.set(false);
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}
