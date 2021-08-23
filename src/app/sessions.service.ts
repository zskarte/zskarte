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
import { Session } from './entity/session';

@Injectable({
  providedIn: 'root',
})
export class SessionsService {
  constructor() {}

  public saveSession(session: Session) {
    localStorage.setItem('session_' + session.uuid, JSON.stringify(session));
  }

  public getSession(sessionId: string) {
    return localStorage.getItem('session_' + sessionId);
  }

  public removeSession(sessionId: string) {
    localStorage.removeItem('session_' + sessionId);
  }

  public getAllSessions() {
    const result: Session[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('session_')) {
        result.push(JSON.parse(localStorage.getItem(key)));
      }
    }
    return result;
  }
}
