import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { AdminComponent } from './admin.component';
import { AdminOrganizationsComponent } from './organizations/admin-organizations.component';
import { AdminOrganizationDialogComponent } from './organizations/admin-organization-dialog.component';
import { AdminOperationsComponent } from './operations/admin-operations.component';
import { AdminOperationDialogComponent } from './operations/admin-operation-dialog.component';
import { AdminPermissionsComponent } from './permissions/admin-permissions.component';
import { I18NService } from '../state/i18n.service';
import { SessionService } from '../session/session.service';

const { trpcMock } = vi.hoisted(() => {
  return {
    trpcMock: {
      admin: {
        organization: {
          list: { query: vi.fn() },
          byId: { query: vi.fn() },
          create: { mutate: vi.fn() },
          update: { mutate: vi.fn() },
          delete: { mutate: vi.fn() },
          uploadLogo: { mutate: vi.fn() },
        },
        operation: {
          list: { query: vi.fn() },
          byId: { query: vi.fn() },
          create: { mutate: vi.fn() },
          update: { mutate: vi.fn() },
          delete: { mutate: vi.fn() },
          archive: { mutate: vi.fn() },
          unarchive: { mutate: vi.fn() },
        },
        permission: {
          getMatrix: { query: vi.fn() },
          toggleRolePermission: { mutate: vi.fn() },
          resetDefaults: { mutate: vi.fn() },
        },
      },
    },
  };
});

vi.mock('../api/trpc.client', () => ({ trpc: trpcMock }));

describe('Admin UI Components', () => {
  let snackBarMock: { open: any };
  let dialogMock: { open: any };
  let routerMock: { navigate: any };
  let sessionServiceMock: { isAdmin: any };
  let i18nMock: { get: any };
  let formBuilder: FormBuilder;

  const createTestInjector = (extraProviders: any[] = []) => {
    return Injector.create({
      providers: [
        { provide: I18NService, useValue: i18nMock },
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: FormBuilder, useValue: formBuilder },
        ...extraProviders,
      ],
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    snackBarMock = { open: vi.fn() };
    dialogMock = { open: vi.fn() };
    routerMock = { navigate: vi.fn() };
    sessionServiceMock = { isAdmin: signal(true) };
    i18nMock = {
      get: vi.fn((key: string) => key),
    };
    formBuilder = new FormBuilder();
  });

  describe('AdminComponent', () => {
    it('should navigate back to operations', () => {
      const injector = createTestInjector();
      const component = runInInjectionContext(injector, () => new AdminComponent());
      component.backToOperations();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/operations']);
    });
  });

  describe('AdminOrganizationsComponent', () => {
    it('should load organizations and filter by search query', async () => {
      const mockOrgs = [
        {
          documentId: 'org-1',
          name: 'ZSO Basel',
          defaultLocale: 'de-CH' as const,
          mapLongitude: 7.58,
          mapLatitude: 47.55,
          mapZoomLevel: 16,
          url: 'https://basel.ch',
          logo: { documentId: 'f-1', name: 'logo.png', url: '/uploads/logo1.png', provider: 'local' },
          operationCount: 3,
          userCount: 10,
        },
        {
          documentId: 'org-2',
          name: 'ZSO Zurich',
          defaultLocale: 'de-CH' as const,
          mapLongitude: 8.54,
          mapLatitude: 47.37,
          mapZoomLevel: 15,
          url: null,
          logo: null,
          operationCount: 1,
          userCount: 5,
        },
      ];

      trpcMock.admin.organization.list.query.mockResolvedValue(mockOrgs);

      const injector = createTestInjector();
      const comp = runInInjectionContext(injector, () => new AdminOrganizationsComponent());
      await comp.loadOrganizations();

      expect(comp.organizations()).toEqual(mockOrgs);
      expect(comp.filteredOrganizations().length).toBe(2);

      comp.searchQuery.set('Zurich');
      expect(comp.filteredOrganizations().length).toBe(1);
      expect(comp.filteredOrganizations()[0].name).toBe('ZSO Zurich');
    });

    it('should delete organization after confirmation', async () => {
      const orgToDelete = {
        documentId: 'org-1',
        name: 'ZSO Basel',
      };

      dialogMock.open.mockReturnValue({
        afterClosed: () => of(true),
      });
      trpcMock.admin.organization.delete.mutate.mockResolvedValue({ success: true });
      trpcMock.admin.organization.list.query.mockResolvedValue([]);

      const injector = createTestInjector();
      const comp = runInInjectionContext(injector, () => new AdminOrganizationsComponent());
      comp.deleteOrganization(orgToDelete as any);

      expect(dialogMock.open).toHaveBeenCalled();
      expect(trpcMock.admin.organization.delete.mutate).toHaveBeenCalledWith({ documentId: 'org-1' });
    });
  });

  describe('AdminOrganizationDialogComponent', () => {
    it('should create new organization with auto-derived username', async () => {
      const dialogRefMock = { close: vi.fn() };
      trpcMock.admin.organization.create.mutate.mockResolvedValue({
        documentId: 'new-org-id',
        name: 'New ZSO',
      });

      const injector = createTestInjector([
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'create' } },
      ]);

      const comp = runInInjectionContext(injector, () => new AdminOrganizationDialogComponent());
      comp.form.patchValue({
        name: 'New ZSO',
        defaultLocale: 'fr-CH',
        url: 'https://new-zso.ch',
        mapLongitude: 6.63,
        mapLatitude: 46.51,
        mapZoomLevel: 14,
        password: 'password123',
        userRole: 'organization',
      });

      expect(comp.form.get('username')?.value).toBe('new_zso');
      expect(comp.form.get('userEmail')?.value).toBe('new_zso@internal.zskarte.ch');

      await comp.save();

      expect(trpcMock.admin.organization.create.mutate).toHaveBeenCalledWith({
        name: 'New ZSO',
        defaultLocale: 'fr-CH',
        url: 'https://new-zso.ch',
        mapLongitude: 6.63,
        mapLatitude: 46.51,
        mapZoomLevel: 14,
        logoId: undefined,
        user: {
          username: 'new_zso',
          password: 'password123',
          email: 'new_zso@internal.zskarte.ch',
          role: 'organization',
        },
      });
      expect(dialogRefMock.close).toHaveBeenCalledWith({ saved: true, result: expect.anything() });
    });

    it('should edit existing organization and allow user updates / password reset', async () => {
      const dialogRefMock = { close: vi.fn() };
      trpcMock.admin.organization.update.mutate.mockResolvedValue({
        documentId: 'org-1',
        name: 'Updated ZSO',
      });

      const injector = createTestInjector([
        { provide: MatDialogRef, useValue: dialogRefMock },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            mode: 'edit',
            organization: {
              documentId: 'org-1',
              name: 'Original ZSO',
              defaultLocale: 'de-CH',
              url: 'https://original.ch',
              mapLongitude: 8.54,
              mapLatitude: 47.37,
              mapZoomLevel: 15,
              logo: { documentId: 'f-1', url: '/uploads/logo.png', name: 'logo.png', provider: 'local' },
              user: {
                id: 'u-1',
                username: 'original_user',
                email: 'original@zso.ch',
                name: 'Original User',
                zsRole: 'organization',
              },
            },
          },
        },
      ]);

      const comp = runInInjectionContext(injector, () => new AdminOrganizationDialogComponent());

      expect(comp.form.get('username')?.value).toBe('original_user');
      expect(comp.form.get('userEmail')?.value).toBe('original@zso.ch');

      comp.form.patchValue({
        name: 'Updated ZSO',
        username: 'updated_user',
        password: 'newpassword123',
        userRole: 'admin',
      });

      await comp.save();

      expect(trpcMock.admin.organization.update.mutate).toHaveBeenCalledWith({
        documentId: 'org-1',
        data: {
          name: 'Updated ZSO',
          defaultLocale: 'de-CH',
          url: 'https://original.ch',
          mapLongitude: 8.54,
          mapLatitude: 47.37,
          mapZoomLevel: 15,
          user: {
            id: 'u-1',
            username: 'updated_user',
            password: 'newpassword123',
            email: 'original@zso.ch',
            role: 'admin',
          },
        },
      });
      expect(dialogRefMock.close).toHaveBeenCalledWith({ saved: true, result: expect.anything() });
    });
  });

  describe('AdminOperationsComponent', () => {
    it('should load operations and filter by organization and phase', async () => {
      const mockOps = [
        {
          documentId: 'op-1',
          name: 'Hochwasser',
          organizationId: 'org-1',
          organizationName: 'ZSO Basel',
          phase: 'active' as const,
          description: 'Einsatz Hochwasser',
          updatedAt: new Date(),
        },
        {
          documentId: 'op-2',
          name: 'Sturm',
          organizationId: 'org-2',
          organizationName: 'ZSO Zurich',
          phase: 'archived' as const,
          description: 'Sturm Lothar',
          updatedAt: new Date(),
        },
      ];

      const mockOrgs = [
        { documentId: 'org-1', name: 'ZSO Basel' },
        { documentId: 'org-2', name: 'ZSO Zurich' },
      ];

      trpcMock.admin.operation.list.query.mockResolvedValue(mockOps);
      trpcMock.admin.organization.list.query.mockResolvedValue(mockOrgs);

      const injector = createTestInjector();
      const comp = runInInjectionContext(injector, () => new AdminOperationsComponent());
      await comp.loadData();

      expect(comp.operations().length).toBe(2);
      expect(comp.organizations().length).toBe(2);

      // Filter by org
      comp.selectedOrgFilter.set('org-1');
      expect(comp.filteredOperations().length).toBe(1);
      expect(comp.filteredOperations()[0].name).toBe('Hochwasser');

      // Filter by phase
      comp.selectedOrgFilter.set('all');
      comp.selectedPhaseFilter.set('archived');
      expect(comp.filteredOperations().length).toBe(1);
      expect(comp.filteredOperations()[0].name).toBe('Sturm');
    });

    it('should archive and unarchive operations', async () => {
      const op = { documentId: 'op-1', phase: 'active' } as any;
      trpcMock.admin.operation.archive.mutate.mockResolvedValue({ success: true });
      trpcMock.admin.operation.unarchive.mutate.mockResolvedValue({ success: true });
      trpcMock.admin.operation.list.query.mockResolvedValue([]);

      const injector = createTestInjector();
      const comp = runInInjectionContext(injector, () => new AdminOperationsComponent());
      await comp.archiveOperation(op);
      expect(trpcMock.admin.operation.archive.mutate).toHaveBeenCalledWith({ documentId: 'op-1' });

      await comp.unarchiveOperation({ documentId: 'op-2', phase: 'archived' } as any);
      expect(trpcMock.admin.operation.unarchive.mutate).toHaveBeenCalledWith({ documentId: 'op-2' });
    });

    it('should move operation to trash on first delete and fully delete on second', async () => {
      const activeOp = { documentId: 'op-1', phase: 'active' } as any;
      const deletedOp = { documentId: 'op-2', phase: 'deleted' } as any;

      trpcMock.admin.operation.update.mutate.mockResolvedValue({ success: true });
      trpcMock.admin.operation.delete.mutate.mockResolvedValue({ success: true });
      trpcMock.admin.operation.list.query.mockResolvedValue([]);
      dialogMock.open.mockReturnValue({
        afterClosed: () => of(true),
      });

      const injector = createTestInjector();
      const comp = runInInjectionContext(injector, () => new AdminOperationsComponent());

      // First click on active op -> update phase to deleted
      await comp.deleteOperation(activeOp);
      expect(trpcMock.admin.operation.update.mutate).toHaveBeenCalledWith({
        documentId: 'op-1',
        data: { phase: 'deleted' },
      });

      // Second click on deleted op -> show confirmation and then delete
      await comp.deleteOperation(deletedOp);
      expect(dialogMock.open).toHaveBeenCalled();
      expect(trpcMock.admin.operation.delete.mutate).toHaveBeenCalledWith({ documentId: 'op-2' });
    });
  });

  describe('AdminOperationDialogComponent', () => {
    it('should create new operation with form data', async () => {
      const dialogRefMock = { close: vi.fn() };
      trpcMock.admin.operation.create.mutate.mockResolvedValue({
        documentId: 'new-op-id',
        name: 'New Operation',
      });

      const injector = createTestInjector([
        { provide: MatDialogRef, useValue: dialogRefMock },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            mode: 'create',
            organizations: [{ documentId: 'org-1', name: 'ZSO Basel' }],
          },
        },
      ]);

      const comp = runInInjectionContext(injector, () => new AdminOperationDialogComponent());
      comp.form.patchValue({
        name: 'New Operation',
        organizationId: 'org-1',
        description: 'Testing operation',
        phase: 'active',
      });

      await comp.save();

      expect(trpcMock.admin.operation.create.mutate).toHaveBeenCalledWith({
        name: 'New Operation',
        organizationId: 'org-1',
        description: 'Testing operation',
        phase: 'active',
      });
      expect(dialogRefMock.close).toHaveBeenCalledWith({ saved: true, result: expect.anything() });
    });
  });

  describe('AdminPermissionsComponent', () => {
    it('should load matrix, group by namespace, and toggle permissions', async () => {
      const mockMatrixData = {
        roles: ['admin', 'organization', 'guest'],
        permissions: ['operation.create', 'operation.list', 'user.invite'],
        matrix: {
          admin: { 'operation.create': true, 'operation.list': true, 'user.invite': true },
          organization: { 'operation.create': true, 'operation.list': true, 'user.invite': false },
          guest: { 'operation.create': false, 'operation.list': true, 'user.invite': false },
        },
      };

      trpcMock.admin.permission.getMatrix.query.mockResolvedValue(mockMatrixData);
      trpcMock.admin.permission.toggleRolePermission.mutate.mockResolvedValue({ success: true });

      const injector = createTestInjector();
      const comp = runInInjectionContext(injector, () => new AdminPermissionsComponent());
      await comp.loadMatrix();

      expect(comp.roles()).toEqual(['admin', 'organization', 'guest']);
      expect(comp.permissionGroups().length).toBe(2); // 'operation' and 'user'

      expect(comp.isPermissionEnabled('guest', 'operation.create')).toBe(false);
      expect(comp.isPermissionEnabled('admin', 'operation.create')).toBe(true);

      // Attempt to toggle admin permission (should be prevented / no-op)
      await comp.onTogglePermission('admin', 'operation.create', false);
      expect(trpcMock.admin.permission.toggleRolePermission.mutate).not.toHaveBeenCalled();
      expect(comp.isPermissionEnabled('admin', 'operation.create')).toBe(true);

      // Toggle guest permission
      await comp.onTogglePermission('guest', 'operation.create', true);
      expect(trpcMock.admin.permission.toggleRolePermission.mutate).toHaveBeenCalledWith({
        role: 'guest',
        permission: 'operation.create',
        enabled: true,
      });
      expect(comp.isPermissionEnabled('guest', 'operation.create')).toBe(true);
    });

    it('should reset permissions to default upon confirmation', async () => {
      dialogMock.open.mockReturnValue({
        afterClosed: () => of(true),
      });
      trpcMock.admin.permission.resetDefaults.mutate.mockResolvedValue({ success: true });
      trpcMock.admin.permission.getMatrix.query.mockResolvedValue({
        roles: ['admin'],
        permissions: ['operation.list'],
        matrix: { admin: { 'operation.list': true } },
      });

      const injector = createTestInjector();
      const comp = runInInjectionContext(injector, () => new AdminPermissionsComponent());
      comp.resetToDefaults();

      expect(dialogMock.open).toHaveBeenCalled();
    });
  });
});
