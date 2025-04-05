import { registerLocaleData } from '@angular/common';
import localeCH from '@angular/common/locales/de-CH';
import { SyncService } from './sync/sync.service';
import { ZsMapStateService } from './state/state.service';
import { ApiService } from './api/api.service';
import { SessionService } from './session/session.service';
import { JournalService } from './journal/journal.service';

registerLocaleData(localeCH);

export function appFactory(session: SessionService, sync: SyncService, state: ZsMapStateService, api: ApiService, journal: JournalService) {
  return async () => {
    // "inject" services to prevent circular dependencies
    session.setStateService(state);
    sync.setStateService(state);
    journal.setStateService(state);
    api.setSessionService(session);

    if (!window.location.pathname.startsWith('/share/')) {
      await session.loadSavedSession();
    }
  };
}
