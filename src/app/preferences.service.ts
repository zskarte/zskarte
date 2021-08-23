/*
 * Copyright © 2018-2020 ZSO Bern Plus / PCi Fribourg
 *
 * This file is part of Zivilschutzkarte 2.
 *
 * Zivilschutzkarte 2 is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * Zivilschutzkarte 2 is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along with
 * Zivilschutzkarte 2.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 */

import { Injectable } from '@angular/core';
import { LIST_OF_ZSO, ZSO } from './entity/zso';
import { Viewport } from './entity/viewport';

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  constructor() {}

  static fallbackViewport: Viewport = {
    coordinates: [905336.3755895211, 5935224.7522306945],
    zoomLevel: 8,
  };

  public setLastSessionId(lastSessionId: string) {
    localStorage.setItem('lastSession', lastSessionId);
  }

  public getLastSessionId(): string {
    return localStorage.getItem('lastSession');
  }

  public setLocale(locale: string) {
    localStorage.setItem('locale', locale);
  }

  public getLocale(): string {
    const locale = localStorage.getItem('locale');
    if (locale) {
      return locale;
    } else {
      const zso = this.getZSO();
      if (zso) {
        return zso.defaultLocale;
      } else {
        return null;
      }
    }
  }

  public removeSessionSpecificPreferences(sessionId: string) {
    localStorage.removeItem('viewport_4_' + sessionId);
    if (this.getLastSessionId() === sessionId) {
      localStorage.removeItem('lastSession');
    }
  }

  public setViewPortForSession(sessionId: string, viewPort: Viewport) {
    localStorage.setItem('viewport_4_' + sessionId, JSON.stringify(viewPort));
  }

  public getViewPortForSession(sessionId: string): Viewport {
    const viewport = localStorage.getItem('viewport_4_' + sessionId);
    if (viewport) {
      // If there is a viewport defined for this session id, we take it...
      return JSON.parse(viewport);
    } else {
      const zso = this.getZSO();
      if (zso) {
        // If a default ZSO is defined, we're going to take the ZSO default viewport...
        return zso.initialViewPort;
      } else {
        // Otherwise, we fall back to the "whole Switzerland" viewport
        return PreferencesService.fallbackViewport;
      }
    }
  }

  public setZSO(zsoId: string) {
    localStorage.setItem('zso', zsoId);
  }

  public getZSO(): ZSO {
    const preferredZSOId = localStorage.getItem('zso');
    if (preferredZSOId) {
      for (const l of LIST_OF_ZSO) {
        if (l.id === preferredZSOId) {
          return l;
        }
      }
    }
    return null;
  }
}
