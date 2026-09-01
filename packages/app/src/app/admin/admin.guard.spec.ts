import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { AdminGuard } from './admin.guard';
import { SessionService } from '../session/session.service';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let sessionServiceMock: { isAdmin: any };
  let routerMock: { parseUrl: any };

  beforeEach(() => {
    sessionServiceMock = {
      isAdmin: signal(false),
    };
    routerMock = {
      parseUrl: (url: string) => ({ toString: () => url, queryParams: {} } as UrlTree),
    };

    TestBed.configureTestingModule({
      providers: [
        AdminGuard,
        { provide: SessionService, useValue: sessionServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    guard = TestBed.inject(AdminGuard);
  });

  it('should allow activation when user is admin', () => {
    sessionServiceMock.isAdmin.set(true);
    const routeSnapshot = { queryParams: { test: '123' } } as unknown as ActivatedRouteSnapshot;

    const result = guard.canActivate(routeSnapshot);
    expect(result).toBe(true);
  });

  it('should redirect to /operations when user is not admin', () => {
    sessionServiceMock.isAdmin.set(false);
    const routeSnapshot = { queryParams: { operationId: 'op-123' } } as unknown as ActivatedRouteSnapshot;

    const result = guard.canActivate(routeSnapshot) as UrlTree;
    expect(result.toString()).toBe('/operations');
    expect(result.queryParams).toEqual({ operationId: 'op-123' });
  });
});
