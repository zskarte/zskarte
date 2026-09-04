import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { I18NService } from '../state/i18n.service';
import { SessionService } from '../session/session.service';
import { ADMIN_TRANSLATIONS } from '../state/translations/admin.translations';

describe('Admin Translations & I18N', () => {
  it('should define all essential admin translations in German, English, French, and Italian', () => {
    const requiredKeys = [
      'adminPanel',
      'backToOperations',
      'organizations',
      'operations',
      'permissions',
      'permissionsMatrix',
      'addOrganization',
      'editOrganization',
      'deleteOrganization',
      'deleteOrganizationConfirm',
      'organizationName',
      'organizationLogo',
      'uploadLogo',
      'mapCoordinates',
      'latitude',
      'longitude',
      'zoomLevel',
      'defaultLocale',
      'filterByOrganization',
      'filterByPhase',
      'resetPermissions',
      'permissionUpdated',
    ] as const;

    for (const key of requiredKeys) {
      expect(ADMIN_TRANSLATIONS).toHaveProperty(key);
      const translation = ADMIN_TRANSLATIONS[key as keyof typeof ADMIN_TRANSLATIONS];
      expect(translation.de).toBeTruthy();
      expect(translation.en).toBeTruthy();
      expect(translation.fr).toBeTruthy();
      expect(translation.it).toBeTruthy();
    }
  });

  it('should retrieve translations via I18NService', () => {
    const mockSession = {
      getLocale: () => 'de',
    };

    TestBed.configureTestingModule({
      providers: [I18NService, { provide: SessionService, useValue: mockSession }],
    });

    const i18n = TestBed.inject(I18NService);

    expect(i18n.get('adminPanel')).toBe('Admin-Bereich');
    expect(i18n.get('backToOperations')).toBe('Zurück zur Ereignisauswahl');
    expect(i18n.get('permissionsMatrix')).toBe('Berechtigungsmatrix');
  });
});
