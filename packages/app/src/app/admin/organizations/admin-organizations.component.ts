import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { I18NService } from '../../state/i18n.service';
import { trpc } from '../../api/trpc.client';
import { trpcRequest } from '../../api/trpc.error';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { AdminOrganizationDialogComponent, AdminOrganizationData } from './admin-organization-dialog.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-organizations',
  templateUrl: './admin-organizations.component.html',
  styleUrls: ['./admin-organizations.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
})
export class AdminOrganizationsComponent implements OnInit {
  public i18n = inject(I18NService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  public organizations = signal<AdminOrganizationData[]>([]);
  public isLoading = signal(false);
  public searchQuery = signal('');

  public displayedColumns: string[] = [
    'logo',
    'name',
    'defaultLocale',
    'coordinates',
    'url',
    'userCount',
    'operationCount',
    'actions',
  ];

  public filteredOrganizations = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const orgs = this.organizations();
    if (!query) return orgs;
    return orgs.filter((org) => org.name.toLowerCase().includes(query));
  });

  public ngOnInit(): void {
    this.loadOrganizations();
  }

  public async loadOrganizations(): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await trpcRequest(trpc.admin.organization.list.query());
      if (response.error || !response.result) {
        this.snackBar.open(this.i18n.get('error'), 'OK', { duration: 3000 });
      } else {
        this.organizations.set(response.result as AdminOrganizationData[]);
      }
    } catch (e) {
      console.error(e);
      this.snackBar.open(this.i18n.get('error'), 'OK', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
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

  public openCreateDialog(): void {
    const dialogRef = this.dialog.open(AdminOrganizationDialogComponent, {
      data: { mode: 'create' },
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.saved) {
        this.loadOrganizations();
      }
    });
  }

  public openEditDialog(org: AdminOrganizationData): void {
    const dialogRef = this.dialog.open(AdminOrganizationDialogComponent, {
      data: { mode: 'edit', organization: org },
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.saved) {
        this.loadOrganizations();
      }
    });
  }

  public deleteOrganization(org: AdminOrganizationData): void {
    const confirmRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: this.i18n.get('deleteOrganization'),
        message: this.i18n.get('deleteOrganizationConfirm'),
        confirmLabel: this.i18n.get('delete'),
        cancelLabel: this.i18n.get('cancel'),
      },
    });

    confirmRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        const res = await trpcRequest(
          trpc.admin.organization.delete.mutate({ documentId: org.documentId }),
        );
        if (res.error) {
          this.snackBar.open(this.i18n.get('error'), 'OK', { duration: 3000 });
        } else {
          this.snackBar.open(this.i18n.get('organizationDeleted'), 'OK', { duration: 3000 });
          this.loadOrganizations();
        }
      }
    });
  }
}
