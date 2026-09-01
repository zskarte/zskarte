import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { I18NService } from '../../state/i18n.service';
import { trpc } from '../../api/trpc.client';
import { trpcRequest } from '../../api/trpc.error';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';

export interface PermissionGroup {
  namespace: string;
  permissions: string[];
}

@Component({
  selector: 'app-admin-permissions',
  templateUrl: './admin-permissions.component.html',
  styleUrls: ['./admin-permissions.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
})
export class AdminPermissionsComponent implements OnInit {
  public i18n = inject(I18NService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  public roles = signal<readonly string[]>([]);
  public permissions = signal<readonly string[]>([]);
  public matrix = signal<Record<string, Record<string, boolean>>>({});
  public isLoading = signal(false);
  public isResetting = signal(false);
  public pendingToggles = signal<Set<string>>(new Set());
  public searchQuery = signal('');

  public displayedColumns = computed(() => {
    return ['permission', ...this.roles()];
  });

  public permissionGroups = computed<PermissionGroup[]>(() => {
    const search = this.searchQuery().trim().toLowerCase();
    const perms = this.permissions();

    const filtered = search ? perms.filter((p) => p.toLowerCase().includes(search)) : perms;

    const groupMap = new Map<string, string[]>();
    for (const p of filtered) {
      const parts = p.split('.');
      const ns = parts.length > 1 ? parts[0] : 'general';
      if (!groupMap.has(ns)) {
        groupMap.set(ns, []);
      }
      groupMap.get(ns)!.push(p);
    }

    const groups: PermissionGroup[] = [];
    for (const [namespace, items] of groupMap.entries()) {
      groups.push({ namespace, permissions: items });
    }
    return groups;
  });

  public ngOnInit(): void {
    this.loadMatrix();
  }

  public async loadMatrix(): Promise<void> {
    this.isLoading.set(true);
    try {
      const res = await trpcRequest(trpc.admin.permission.getMatrix.query());
      if (res.result) {
        this.roles.set(res.result.roles);
        this.permissions.set(res.result.permissions);
        this.matrix.set(res.result.matrix as Record<string, Record<string, boolean>>);
      } else if (res.error) {
        this.snackBar.open(this.i18n.get('error'), 'OK', { duration: 3000 });
      }
    } catch (e) {
      console.error(e);
      this.snackBar.open(this.i18n.get('error'), 'OK', { duration: 3000 });
    } finally {
      this.isLoading.set(false);
    }
  }

  public isPermissionEnabled(role: string, permission: string): boolean {
    if (role === 'admin') {
      return true;
    }
    return this.matrix()[role]?.[permission] ?? false;
  }

  public isToggling(role: string, permission: string): boolean {
    return this.pendingToggles().has(`${role}:${permission}`);
  }

  public async onTogglePermission(role: string, permission: string, checked: boolean): Promise<void> {
    if (role === 'admin') {
      return;
    }

    const key = `${role}:${permission}`;
    const pending = new Set(this.pendingToggles());
    pending.add(key);
    this.pendingToggles.set(pending);

    // Optimistic update
    const currentMatrix = { ...this.matrix() };
    if (!currentMatrix[role]) {
      currentMatrix[role] = {};
    }
    currentMatrix[role] = { ...currentMatrix[role], [permission]: checked };
    this.matrix.set(currentMatrix);

    try {
      const res = await trpcRequest(
        trpc.admin.permission.toggleRolePermission.mutate({
          role: role as any,
          permission: permission as any,
          enabled: checked,
        }),
      );

      if (res.error) {
        // Revert on error
        const rollbackMatrix = { ...this.matrix() };
        rollbackMatrix[role] = { ...rollbackMatrix[role], [permission]: !checked };
        this.matrix.set(rollbackMatrix);
        this.snackBar.open(this.i18n.get('permissionUpdateError'), 'OK', { duration: 3000 });
      } else {
        this.snackBar.open(this.i18n.get('permissionUpdated'), undefined, { duration: 1500 });
      }
    } catch (e) {
      console.error(e);
      const rollbackMatrix = { ...this.matrix() };
      rollbackMatrix[role] = { ...rollbackMatrix[role], [permission]: !checked };
      this.matrix.set(rollbackMatrix);
      this.snackBar.open(this.i18n.get('permissionUpdateError'), 'OK', { duration: 3000 });
    } finally {
      const updatedPending = new Set(this.pendingToggles());
      updatedPending.delete(key);
      this.pendingToggles.set(updatedPending);
    }
  }

  public resetToDefaults(): void {
    const confirmRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: this.i18n.get('resetPermissions'),
        message: this.i18n.get('resetPermissionsConfirm'),
        confirmLabel: this.i18n.get('resetPermissions'),
        cancelLabel: this.i18n.get('cancel'),
      },
    });

    confirmRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        this.isResetting.set(true);
        try {
          const res = await trpcRequest(trpc.admin.permission.resetDefaults.mutate());
          if (res.error) {
            this.snackBar.open(this.i18n.get('error'), 'OK', { duration: 3000 });
          } else {
            this.snackBar.open(this.i18n.get('permissionsResetSuccess'), 'OK', { duration: 3000 });
            await this.loadMatrix();
          }
        } catch (e) {
          console.error(e);
          this.snackBar.open(this.i18n.get('error'), 'OK', { duration: 3000 });
        } finally {
          this.isResetting.set(false);
        }
      }
    });
  }
}
