import { registerLocaleData } from '@angular/common';
import localeCH from '@angular/common/locales/de-CH';
import { SyncService } from './sync/sync.service';
import { ZsMapStateService } from './state/state.service';
import { SessionService } from './session/session.service';
import { JournalService } from './journal/journal.service';
import { SearchService } from './search/search.service';
import { OperationService } from './session/operations/operation.service';
import { ChangesetService } from './changeset/changeset.service';
import { SidebarService } from './sidebar/sidebar.service';

registerLocaleData(localeCH);

export function appFactory(
  session: SessionService,
  sync: SyncService,
  state: ZsMapStateService,
  journal: JournalService,
  search: SearchService,
  operation: OperationService,
  changeset: ChangesetService,
  sidebar: SidebarService,
) {
  return async () => {
    // "inject" services to prevent circular dependencies
    session.setStateService(state);
    sync.setStateService(state);
    journal.setStateService(state);
    journal.setSearchService(search);
    operation.setJournalService(journal);
    changeset.setStateService(state);
    changeset.setSidebarService(sidebar);
    changeset.setSessionService(session);

    if (!window.location.pathname.startsWith('/share/')) {
      await session.loadSavedSession();
    }
  };
}
