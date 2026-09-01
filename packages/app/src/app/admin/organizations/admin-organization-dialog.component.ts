import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
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
import { DialogHeaderComponent, DialogBodyComponent, DialogFooterComponent } from '../../ui/dialog-layout';
import { environment } from '../../../environments/environment';

export interface AdminOrganizationData {
  documentId: string;
  name: string;
  mapLongitude?: number | null;
  mapLatitude?: number | null;
  mapZoomLevel?: number | null;
  defaultLocale?: 'de-CH' | 'fr-CH' | 'it-CH' | 'en-US' | null;
  url?: string | null;
  logo?: {
    documentId: string;
    name: string;
    url: string;
    provider: string;
  } | null;
  operationCount?: number;
  userCount?: number;
  user?: {
    id: string;
    username: string | null;
    email: string;
    name: string;
    zsRole: string;
  } | null;
}

export interface AdminOrganizationDialogData {
  mode: 'create' | 'edit';
  organization?: AdminOrganizationData;
}

@Component({
  selector: 'app-admin-organization-dialog',
  templateUrl: './admin-organization-dialog.component.html',
  styleUrls: ['./admin-organization-dialog.component.scss'],
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
export class AdminOrganizationDialogComponent {
  public i18n = inject(I18NService);
  private fb = inject(FormBuilder);
  private dialogRef = inject<MatDialogRef<AdminOrganizationDialogComponent>>(MatDialogRef);
  private snackBar = inject(MatSnackBar);
  public data: AdminOrganizationDialogData = inject(MAT_DIALOG_DATA) || { mode: 'create' };

  public isSaving = signal(false);
  public isUploadingLogo = signal(false);
  public logoPreview = signal<string | null>(null);
  public logoRemoved = signal(false);
  public hidePassword = signal(true);

  public availableRoles = [
    { value: 'organization', label: 'Organization' },
    { value: 'admin', label: 'Admin' },
    { value: 'operationwrite', label: 'Operation Write' },
    { value: 'operationread', label: 'Operation Read' },
    { value: 'guest', label: 'Guest' },
  ];

  private selectedLogoFile: {
    fileName: string;
    mimeType: 'image/png' | 'image/jpeg' | 'image/svg+xml' | 'image/webp';
    base64: string;
  } | null = null;

  public locales = [
    { value: 'de-CH', label: 'Deutsch (Schweiz)' },
    { value: 'fr-CH', label: 'Français (Suisse)' },
    { value: 'it-CH', label: 'Italiano (Svizzera)' },
    { value: 'en-US', label: 'English (US)' },
  ];

  public form = this.fb.group({
    name: [this.data.organization?.name ?? '', [Validators.required, Validators.minLength(1)]],
    defaultLocale: [this.data.organization?.defaultLocale ?? 'de-CH'],
    url: [this.data.organization?.url ?? ''],
    mapLongitude: [this.data.organization?.mapLongitude ?? 828675.74],
    mapLatitude: [this.data.organization?.mapLatitude ?? 5933353.21],
    mapZoomLevel: [this.data.organization?.mapZoomLevel ?? 16],
    username: [
      this.data.organization?.user?.username ?? '',
      [Validators.required, Validators.minLength(1)],
    ],
    password: [
      '',
      this.data.mode === 'create'
        ? [Validators.required, Validators.minLength(6)]
        : [Validators.minLength(6)],
    ],
    userEmail: [this.data.organization?.user?.email ?? '', [Validators.email]],
    userRole: [this.data.organization?.user?.zsRole ?? 'organization'],
  });

  constructor() {
    if (this.data.organization?.logo?.url) {
      const url = this.data.organization.logo.url;
      this.logoPreview.set(this.resolveLogoUrl(url));
    }

    if (this.data.mode === 'edit' && this.data.organization?.documentId && !this.data.organization.user) {
      trpcRequest(
        trpc.admin.organization.byId.query({ documentId: this.data.organization.documentId }),
      ).then((res) => {
        if (res.result) {
          const orgUser = (res.result as any).user || (res.result as any).users?.[0];
          if (orgUser) {
            if (this.data.organization) {
              this.data.organization.user = orgUser;
            }
            this.form.patchValue({
              username: orgUser.username || '',
              userEmail: orgUser.email || '',
              userRole: orgUser.zsRole || 'organization',
            });
          }
        }
      });
    }
  }

  public resolveLogoUrl(url?: string | null): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const baseUrl = environment.apiUrlNext || environment.apiUrl || '';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.snackBar.open(this.i18n.get('logoUploadError'), 'OK', { duration: 3000 });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.selectedLogoFile = {
        fileName: file.name,
        mimeType: file.type as any,
        base64,
      };
      this.logoPreview.set(base64);
      this.logoRemoved.set(false);
    };
    reader.readAsDataURL(file);
  }

  public removeLogo(): void {
    this.selectedLogoFile = null;
    this.logoPreview.set(null);
    this.logoRemoved.set(true);
  }

  public async save(): Promise<void> {
    if (this.form.invalid || this.isSaving()) return;

    this.isSaving.set(true);
    try {
      const formVal = this.form.value;
      let logoId: string | null | undefined = undefined;

      if (this.selectedLogoFile) {
        this.isUploadingLogo.set(true);
        const uploadRes = await trpcRequest(
          trpc.admin.organization.uploadLogo.mutate({
            fileName: this.selectedLogoFile.fileName,
            mimeType: this.selectedLogoFile.mimeType,
            base64: this.selectedLogoFile.base64,
            organizationId: this.data.organization?.documentId,
          }),
        );
        this.isUploadingLogo.set(false);

        if (uploadRes.error || !uploadRes.result) {
          this.snackBar.open(this.i18n.get('logoUploadError'), 'OK', { duration: 3000 });
          this.isSaving.set(false);
          return;
        }
        logoId = uploadRes.result.documentId;
      } else if (this.logoRemoved()) {
        logoId = null;
      }

      if (this.data.mode === 'create') {
        const createRes = await trpcRequest(
          trpc.admin.organization.create.mutate({
            name: formVal.name!.trim(),
            defaultLocale: formVal.defaultLocale as any,
            url: formVal.url?.trim() || null,
            mapLongitude: formVal.mapLongitude ?? undefined,
            mapLatitude: formVal.mapLatitude ?? undefined,
            mapZoomLevel: formVal.mapZoomLevel ?? undefined,
            logoId: logoId ?? undefined,
            user: {
              username: formVal.username!.trim(),
              password: formVal.password!,
              email: formVal.userEmail?.trim() || undefined,
              role: (formVal.userRole as any) || 'organization',
            },
          }),
        );

        if (createRes.error) {
          this.snackBar.open(this.i18n.get('error'), 'OK', { duration: 3000 });
        } else {
          this.snackBar.open(this.i18n.get('organizationCreated'), 'OK', { duration: 3000 });
          this.dialogRef.close({ saved: true, result: createRes.result });
        }
      } else {
        const orgId = this.data.organization!.documentId;
        const updateData: any = {
          name: formVal.name!.trim(),
          defaultLocale: formVal.defaultLocale as any,
          url: formVal.url?.trim() || null,
          mapLongitude: formVal.mapLongitude ?? undefined,
          mapLatitude: formVal.mapLatitude ?? undefined,
          mapZoomLevel: formVal.mapZoomLevel ?? undefined,
          user: {
            id: this.data.organization?.user?.id,
            username: formVal.username?.trim(),
            password: formVal.password?.trim() ? formVal.password : undefined,
            email: formVal.userEmail?.trim() || undefined,
            role: (formVal.userRole as any) || undefined,
          },
        };

        if (logoId !== undefined) {
          updateData.logoId = logoId;
        }

        const updateRes = await trpcRequest(
          trpc.admin.organization.update.mutate({
            documentId: orgId,
            data: updateData,
          }),
        );

        if (updateRes.error) {
          this.snackBar.open(this.i18n.get('error'), 'OK', { duration: 3000 });
        } else {
          this.snackBar.open(this.i18n.get('organizationUpdated'), 'OK', { duration: 3000 });
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
