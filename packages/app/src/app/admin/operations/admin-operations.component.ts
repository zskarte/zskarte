import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { I18NService } from '../../state/i18n.service';
import { trpc } from '../../api/trpc.client';
import { trpcRequest } from '../../api/trpc.error';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { AdminOperationDialogComponent, AdminOperationData } from './admin-operation-dialog.component';
import type { AdminOrganizationData } from '../organizations/admin-organization-dialog.component';

@Component({
  selector: 'app-admin-operations',
  templateUrl: './admin-operations.component.html',
  styleUrls: ['./admin-operations.component.scss'],
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
})
export class AdminOperationsComponent implements OnInit {
  public i18n = inject(I18NService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  public operations = signal<AdminOperationData[]>([]);
  public organizations = signal<AdminOrganizationData[]>([]);
  public isLoading = signal(false);

  public selectedOrgFilter = signal<string>('all');
  public selectedPhaseFilter = signal<string>('all');
  public searchQuery = signal<string>('');

  public displayedColumns: string[] = [
    'name',
    'organization',
    'phase',
    'description',
    'updatedAt',
    'actions',
  ];

  public filteredOperations = computed(() => {
    let list = this.operations();
    const orgId = this.selectedOrgFilter();
    const phase = this.selectedPhaseFilter();
    const search = this.searchQuery().trim().toLowerCase();

    if (orgId !== 'all') {
      list = list.filter((op) => op.organizationId === orgId);
    }

    if (phase !== 'all') {
      list = list.filter((op) => op.phase === phase);
    }

    if (search) {
      list = list.filter(
        (op) =>
          op.name.toLowerCase().includes(search) ||
          op.description?.toLowerCase().includes(search) ||
          op.organizationName?.toLowerCase().includes(search),
      );
    }

    return list;
  });

  public ngOnInit(): void {
    this.loadData();
  }

  public async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [opsRes, orgsRes] = await Promise.all([
        trpcRequest(trpc.admin.operation.list.query()),
        trpcRequest(trpc.admin.organization.list.query()),
      ]);

      if (orgsRes.result) {
        this.organizations.set(orgsRes.result as AdminOrganizationData[]);
      }

      if (opsRes.result) {
        this.operations.set(opsRes.result as AdminOperationData[]);
      } else if (opsRes.error) {
        this.snackBar.open(this.i18n.get('error'), 'OK', { duration: 3000 });
      }
    } catch (e) {
      console.error(e);
      this.snackBar.open(this.i18n.get('error'), 'OK', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  public async loadOperations(): Promise<void> {
    this.isLoading.set(true);
    try {
      const opsRes = await trpcRequest(trpc.admin.operation.list.query());
      if (opsRes.result) {
        this.operations.set(opsRes.result as AdminOperationData[]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }

  public openCreateDialog(): void {
    const dialogRef = this.dialog.open(AdminOperationDialogComponent, {
      data: {
        mode: 'create',
        organizations: this.organizations(),
        selectedOrganizationId: this.selectedOrgFilter() !== 'all' ? this.selectedOrgFilter() : undefined,
      },
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.saved) {
        this.loadOperations();
      }
    });
  }

  public openEditDialog(operation: AdminOperationData): void {
    const dialogRef = this.dialog.open(AdminOperationDialogComponent, {
      data: {
        mode: 'edit',
        operation,
        organizations: this.organizations(),
      },
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.saved) {
        this.loadOperations();
      }
    });
  }

  public async archiveOperation(operation: AdminOperationData): Promise<void> {
    const res = await trpcRequest(
      trpc.admin.operation.archive.mutate({ documentId: operation.documentId }),
    );
    if (res.error) {
      this.snackBar.open(this.i18n.get('error'), 'OK', { duration: 3000 });
    } else {
      this.snackBar.open(this.i18n.get('operationArchived'), 'OK', { duration: 3000 });
      this.loadOperations();
    }
  }

  public async unarchiveOperation(operation: AdminOperationData): Promise<void> {
    const res = await trpcRequest(
      trpc.admin.operation.unarchive.mutate({ documentId: operation.documentId }),
    );
    if (res.error) {
      this.snackBar.open(this.i18n.get('error'), 'OK', { duration: 3000 });
    } else {
      this.snackBar.open(this.i18n.get('operationUnarchived'), 'OK', { duration: 3000 });
      this.loadOperations();
    }
  }

  public deleteOperation(operation: AdminOperationData): void {
    const confirmRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: this.i18n.get('deleteOperation'),
        message: this.i18n.get('deleteOperationConfirm'),
        confirmLabel: this.i18n.get('delete'),
        cancelLabel: this.i18n.get('cancel'),
      },
    });

    confirmRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        const res = await trpcRequest(
          trpc.admin.operation.delete.mutate({ documentId: operation.documentId }),
        );
        if (res.error) {
          this.snackBar.open(this.i18n.get('error'), 'OK', { duration: 3000 });
        } else {
          this.snackBar.open(this.i18n.get('operationDeleted'), 'OK', { duration: 3000 });
          this.loadOperations();
        }
      }
    });
  }
}
