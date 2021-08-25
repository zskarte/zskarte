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
